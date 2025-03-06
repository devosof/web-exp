"use client";

import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Spin, Popconfirm, Typography, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  isActive: boolean;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/job-postings');
      const data = await response.json();
      setJobs(data.jobPostings || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      message.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (job?: Job) => {
    setEditingJob(job || null);
    if (job) {
      form.setFieldsValue({
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        location: job.location,
        isActive: job.isActive,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ isActive: true });
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/job-postings/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Job posting deleted successfully');
        fetchJobs();
      } else {
        message.error('Failed to delete job posting');
      }
    } catch (error) {
      console.error('Error deleting job posting:', error);
      message.error('Failed to delete job posting');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const url = editingJob
        ? `/api/admin/job-postings/${editingJob._id}`
        : '/api/admin/job-postings';

      const method = editingJob ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success(`Job posting ${editingJob ? 'updated' : 'created'} successfully`);
        setIsModalVisible(false);
        form.resetFields();
        fetchJobs();
      } else {
        message.error(`Failed to ${editingJob ? 'update' : 'create'} job posting`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error('Please check your form inputs');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
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
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => text.length > 100 ? `${text.substring(0, 100)}...` : text,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Job) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Delete this job posting?"
            description="Are you sure you want to delete this job posting?"
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
        <Title level={2}>Job Postings</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
        >
          Add Job Posting
        </Button>
      </div>

      <Table 
        dataSource={jobs} 
        columns={columns} 
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={`${editingJob ? 'Edit' : 'Add'} Job Posting`}
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
            loading={submitting}
            onClick={handleSubmit}
          >
            {editingJob ? 'Update' : 'Create'}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="jobForm"
          initialValues={{ isActive: true }}
        >
          <Form.Item
            name="title"
            label="Job Title"
            rules={[{ required: true, message: 'Please enter a job title' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: 'Please enter a location' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <TextArea rows={6} />
          </Form.Item>

          <Form.Item
            name="requirements"
            label="Requirements"
            rules={[{ required: true, message: 'Please enter requirements' }]}
          >
            <TextArea rows={6} />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}