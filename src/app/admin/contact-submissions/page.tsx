"use client";

import { useState, useEffect } from 'react';
import { Table, Button, Modal, Typography, Spin, Popconfirm, Space, message, Tag } from 'antd';
import { DeleteOutlined, EyeOutlined, MailOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
}

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchSubmissions(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);

  const fetchSubmissions = async (page: number, limit: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contact-submissions?page=${page}&limit=${limit}`);
      const data = await response.json();
      
      setSubmissions(data.contactSubmissions || []);
      setPagination({
        ...pagination,
        total: data.total || 0,
      });
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      message.error('Failed to fetch contact submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination: any) => {
    setPagination({
      ...pagination,
      current: pagination.current,
    });
  };

  const showModal = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedSubmission(null);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/contact-submissions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Contact submission deleted successfully');
        fetchSubmissions(pagination.current, pagination.pageSize);
      } else {
        message.error('Failed to delete contact submission');
      }
    } catch (error) {
      console.error('Error deleting contact submission:', error);
      message.error('Failed to delete contact submission');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <a href={`mailto:${email}`}>
          <Space>
            <MailOutlined />
            {email}
          </Space>
        </a>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => phone || 'N/A',
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (text: string) => text.length > 50 ? `${text.substring(0, 50)}...` : text,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
      sorter: (a: ContactSubmission, b: ContactSubmission) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ContactSubmission) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Delete this submission?"
            description="Are you sure you want to delete this contact submission?"
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

  if (loading && submissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Contact Submissions</Title>
      </div>

      <Table 
        dataSource={submissions} 
        columns={columns} 
        rowKey="_id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
        }}
        onChange={handleTableChange}
        loading={loading}
      />

      <Modal
        title="Contact Submission Details"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Close
          </Button>,
          <Button
            key="reply"
            type="primary"
            icon={<MailOutlined />}
            onClick={() => window.open(`mailto:${selectedSubmission?.email}`)}
          >
            Reply
          </Button>,
        ]}
      >
        {selectedSubmission && (
          <div>
            <div className="mb-4">
              <Text strong>Date:</Text>
              <Paragraph>{formatDate(selectedSubmission.createdAt)}</Paragraph>
            </div>
            
            <div className="mb-4">
              <Text strong>Name:</Text>
              <Paragraph>{selectedSubmission.name}</Paragraph>
            </div>
            
            <div className="mb-4">
              <Text strong>Email:</Text>
              <Paragraph>
                <a href={`mailto:${selectedSubmission.email}`}>{selectedSubmission.email}</a>
              </Paragraph>
            </div>
            
            {selectedSubmission.phone && (
              <div className="mb-4">
                <Text strong>Phone:</Text>
                <Paragraph>{selectedSubmission.phone}</Paragraph>
              </div>
            )}
            
            <div className="mb-4">
              <Text strong>Message:</Text>
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{selectedSubmission.message}</Paragraph>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}