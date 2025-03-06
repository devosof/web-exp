"use client";

import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Upload, message, Spin, Popconfirm, Typography, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';

const { Title } = Typography;
const { TextArea } = Input;

interface Service {
  _id: string;
  title: string;
  description: string;
  image: string;
  order: number;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      message.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (service?: Service) => {
    setEditingService(service || null);
    if (service) {
      form.setFieldsValue({
        title: service.title,
        description: service.description,
        order: service.order,
      });
      // Set file list for existing image
      setFileList([
        {
          uid: '-1',
          name: 'Current Image',
          status: 'done',
          url: service.image,
        },
      ]);
    } else {
      form.resetFields();
      setFileList([]);
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setFileList([]);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Service deleted successfully');
        fetchServices();
      } else {
        message.error('Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      message.error('Failed to delete service');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setUploading(true);

      // Handle image upload if there's a new file
      let imageUrl = editingService?.image || '';
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const formData = new FormData();
        formData.append('file', fileList[0].originFileObj);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload image');
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      const serviceData = {
        ...values,
        image: imageUrl,
      };

      const url = editingService
        ? `/api/admin/services/${editingService._id}`
        : '/api/admin/services';

      const method = editingService ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (response.ok) {
        message.success(`Service ${editingService ? 'updated' : 'created'} successfully`);
        setIsModalVisible(false);
        form.resetFields();
        setFileList([]);
        fetchServices();
      } else {
        message.error(`Failed to ${editingService ? 'update' : 'create'} service`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error('Please check your form inputs');
    } finally {
      setUploading(false);
    }
  };

  const uploadProps: UploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return Upload.LIST_IGNORE;
      }
      setFileList([file]);
      return false;
    },
    fileList,
    listType: 'picture',
    maxCount: 1,
  };

  const columns = [
    {
      title: 'Order',
      dataIndex: 'order',
      key: 'order',
      sorter: (a: Service, b: Service) => a.order - b.order,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image: string) => (
        <img src={image} alt="Service" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => text.length > 100 ? `${text.substring(0, 100)}...` : text,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Service) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Delete this service?"
            description="Are you sure you want to delete this service?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Services</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
        >
          Add Service
        </Button>
      </div>

      <Table 
        dataSource={services} 
        columns={columns} 
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={`${editingService ? 'Edit' : 'Add'} Service`}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={uploading}
            onClick={handleSubmit}
          >
            {editingService ? 'Update' : 'Create'}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="serviceForm"
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="order"
            label="Order"
            rules={[{ required: true, message: 'Please enter an order number' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Image"
            rules={[{ required: !editingService, message: 'Please upload an image' }]}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Select Image</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}