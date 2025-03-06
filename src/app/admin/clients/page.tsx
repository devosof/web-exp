"use client";

import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Upload, message, Spin, Popconfirm, Typography, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, LinkOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';

const { Title } = Typography;
const { TextArea } = Input;

interface Client {
  _id: string;
  name: string;
  logo: string;
  order: number;
  description?: string;
  website?: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      const data = await response.json();
      setClients(data.clients || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      message.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (client?: Client) => {
    setEditingClient(client || null);
    if (client) {
      form.setFieldsValue({
        name: client.name,
        description: client.description,
        order: client.order,
        website: client.website,
      });
      // Set file list for existing logo
      if (client.logo) {
        setFileList([
          {
            uid: '-1',
            name: 'Current Logo',
            status: 'done',
            url: client.logo,
          },
        ]);
      } else {
        setFileList([]);
      }
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
      const response = await fetch(`/api/admin/clients/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Client deleted successfully');
        fetchClients();
      } else {
        message.error('Failed to delete client');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      message.error('Failed to delete client');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setUploading(true);

      // Handle logo upload if there's a new file
      let logoUrl = editingClient?.logo || '';
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

      const clientData = {
        ...values,
        logo: logoUrl,
      };

      const url = editingClient
        ? `/api/admin/clients/${editingClient._id}`
        : '/api/admin/clients';

      const method = editingClient ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      if (response.ok) {
        message.success(`Client ${editingClient ? 'updated' : 'created'} successfully`);
        setIsModalVisible(false);
        form.resetFields();
        setFileList([]);
        fetchClients();
      } else {
        message.error(`Failed to ${editingClient ? 'update' : 'create'} client`);
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
      sorter: (a: Client, b: Client) => a.order - b.order,
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
        <img src={logo} alt="Client Logo" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
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
      render: (_: any, record: Client) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Delete this client?"
            description="Are you sure you want to delete this client?"
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
        <Title level={2}>Clients</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
        >
          Add Client
        </Button>
      </div>

      <Table 
        dataSource={clients} 
        columns={columns} 
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={`${editingClient ? 'Edit' : 'Add'} Client`}
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
            {editingClient ? 'Update' : 'Create'}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="clientForm"
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
            label="Logo"
            rules={[{ required: !editingClient, message: 'Please upload a logo' }]}
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