"use client";

import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Upload, message, Spin, Popconfirm, Typography, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';

const { Title } = Typography;
const { TextArea } = Input;

interface CaseStudy {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export default function CaseStudiesPage() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingCaseStudy, setEditingCaseStudy] = useState<CaseStudy | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  const fetchCaseStudies = async () => {
    try {
      const response = await fetch('/api/case-studies');
      const data = await response.json();
      setCaseStudies(data.caseStudies || []);
    } catch (error) {
      console.error('Error fetching case studies:', error);
      message.error('Failed to fetch case studies');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (caseStudy?: CaseStudy) => {
    setEditingCaseStudy(caseStudy || null);
    if (caseStudy) {
      form.setFieldsValue({
        title: caseStudy.title,
        description: caseStudy.description,
      });
      // Set file list for existing image
      if (caseStudy.imageUrl) {
        setFileList([
          {
            uid: '-1',
            name: 'Current Image',
            status: 'done',
            url: caseStudy.imageUrl,
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
      const response = await fetch(`/api/admin/case-studies/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Case study deleted successfully');
        fetchCaseStudies();
      } else {
        message.error('Failed to delete case study');
      }
    } catch (error) {
      console.error('Error deleting case study:', error);
      message.error('Failed to delete case study');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setUploading(true);

      // Handle image upload if there's a new file
      let imageUrl = editingCaseStudy?.imageUrl || '';
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

      const caseStudyData = {
        ...values,
        imageUrl: imageUrl,
      };

      const url = editingCaseStudy
        ? `/api/admin/case-studies/${editingCaseStudy._id}`
        : '/api/admin/case-studies';

      const method = editingCaseStudy ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(caseStudyData),
      });

      if (response.ok) {
        message.success(`Case study ${editingCaseStudy ? 'updated' : 'created'} successfully`);
        setIsModalVisible(false);
        form.resetFields();
        setFileList([]);
        fetchCaseStudies();
      } else {
        message.error(`Failed to ${editingCaseStudy ? 'update' : 'create'} case study`);
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
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (imageUrl: string) => (
        imageUrl ? <img src={imageUrl} alt="Case Study" style={{ width: '50px', height: '50px', objectFit: 'cover' }} /> : 'No image'
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => text ? (text.length > 100 ? `${text.substring(0, 100)}...` : text) : 'No description',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CaseStudy) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Delete this case study?"
            description="Are you sure you want to delete this case study?"
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
        <Title level={2}>Case Studies</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
        >
          Add Case Study
        </Button>
      </div>

      <Table 
        dataSource={caseStudies} 
        columns={columns} 
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={`${editingCaseStudy ? 'Edit' : 'Add'} Case Study`}
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
            {editingCaseStudy ? 'Update' : 'Create'}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="caseStudyForm"
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
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="Image"
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