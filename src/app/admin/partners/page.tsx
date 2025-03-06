"use client";

import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Upload, Switch, message, Spin, Popconfirm, Typography, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, LinkOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';

const { Title } = Typography;
const { TextArea } = Input;

interface Partner {
  _id: string;
  name: string;
  logo: string;
  order: number;
  description: string;
  website?: string;
  isActive: boolean;
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await fetch('/api/partners');
      const data = await response.json();
      setPartners(data.partners || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
      message.error('Failed to fetch partners');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (partner?: Partner) => {
    setEditingPartner(partner || null);
    if (partner) {
      form.setFieldsValue({
        name: partner.name,
        description: partner.description,
        order: partner.order,
        website: partner.website,
        isActive: partner.isActive,
      });
      // Set file list for existing logo
      if (partner.logo) {
        setFileList([
          {
            uid: '-1',
            name: 'Current Logo',
            status: 'done',
            url: partner.logo,
          },
        ]);
      } else {
        setFileList([]);
      }
    } else {
      form.resetFields();
      form.setFieldsValue({ isActive: true });
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
      const response = await fetch(`/api/admin/partners/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Partner deleted successfully');
        fetchPartners();
      } else {
        message.error('Failed to delete partner');
      }
    } catch (error) {
      console.error('Error deleting partner:', error);
      message.error('Failed to delete partner');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setUploading(true);

      // Handle logo upload if there's a new file
      let logoUrl = editingPartner?.logo || '';
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const formData = new FormData();
        formData.append('file', fileList[0].originFileObj);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload logo');
        }

        const uploadData = await uploadRes.json();
        logoUrl = uploadData.url;
      }

      const partnerData = {
        ...values,
        logo: logoUrl,
      };

      const url = editingPartner
        ? `/api/admin/partners/${editingPartner._id}`
        : '/api/admin/partners';

      const method = editingPartner ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partnerData),
      });

      if (response.ok) {
        message.success(`Partner ${editingPartner ? 'updated' : 'created'} successfully`);
        setIsModalVisible(false);
        form.resetFields();
        setFileList([]);
        fetchPartners();
      } else {
        message.error(`Failed to ${editingPartner ? 'update' : 'create'} partner`);
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
      sorter: (a: Partner, b: Partner) => a.order - b.order,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Logo',
      dataIndex: 'logo',
      key: 'logo',
      render: (logo: string) => (
        <img src={logo} alt="Partner Logo" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <span className={isActive ? 'text-green-600' : 'text-red-600'}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'Website',
      dataIndex: 'website',
      key: 'website',
      render: (website: string) => (
        website ? (
          <a href={website} target="_blank" rel="noopener noreferrer">
            <LinkOutlined /> Visit
          </a>
        ) : 'N/A'
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Partner) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Delete this partner?"
            description="Are you sure you want to delete this partner?"
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
        <Title level={2}>Partners</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
        >
          Add Partner
        </Button>
      </div>

      <Table 
        dataSource={partners} 
        columns={columns} 
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={`${editingPartner ? 'Edit' : 'Add'} Partner`}
        open={isModalVisible}
        onCancel={handleCancel}
        width={800}
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
            {editingPartner ? 'Update' : 'Create'}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="partnerForm"
          initialValues={{ isActive: true }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter a name' }]}
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
            name="website"
            label="Website URL"
            rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
          >
            <Input prefix={<LinkOutlined />} placeholder="https://example.com" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Logo"
            rules={[{ required: !editingPartner, message: 'Please upload a logo' }]}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Select Logo</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}