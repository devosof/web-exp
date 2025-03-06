"use client";

import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, DatePicker, Upload, message, Spin, Popconfirm, Typography, Space, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface BlogArticle {
  _id: string;
  title: string;
  content: string;
  author: string;
  publishedAt: string;
  isPublished: boolean;
  thumbnail?: string;
  excerpt?: string;
  category?: string;
}

export default function BlogPage() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingArticle, setEditingArticle] = useState<BlogArticle | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/blog-articles');
      const data = await response.json();
      console.log("blog articles:", data);
      setArticles(data.blogArticles || []);
    } catch (error) {
      console.error('Error fetching blog articles:', error);
      message.error('Failed to fetch blog articles');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (article?: BlogArticle) => {
    setEditingArticle(article || null);
    if (article) {
      form.setFieldsValue({
        title: article.title,
        content: article.content,
        author: article.author,
        publishedAt: article.publishedAt ? dayjs(article.publishedAt) : undefined,
        isPublished: article.isPublished,
        excerpt: article.excerpt,
        category: article.category,
      });
      // Set file list for existing thumbnail
      if (article.thumbnail) {
        setFileList([
          {
            uid: '-1',
            name: 'Current Thumbnail',
            status: 'done',
            url: article.thumbnail,
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
      const response = await fetch(`/api/admin/blog-articles/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Blog article deleted successfully');
        fetchArticles();
      } else {
        message.error('Failed to delete blog article');
      }
    } catch (error) {
      console.error('Error deleting blog article:', error);
      message.error('Failed to delete blog article');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setUploading(true);

      // Handle thumbnail upload if there's a new file
      let thumbnailUrl = editingArticle?.thumbnail || '';
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const formData = new FormData();
        formData.append('file', fileList[0].originFileObj);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload thumbnail');
        }

        const uploadData = await uploadRes.json();
        thumbnailUrl = uploadData.url;
      }

      // Format the date properly
      const formattedValues = {
        ...values,
        publishedAt: values.publishedAt ? values.publishedAt.toISOString() : new Date().toISOString(),
        thumbnail: thumbnailUrl,
      };

      const url = editingArticle
        ? `/api/admin/blog-articles/${editingArticle._id}`
        : '/api/admin/blog-articles';

      const method = editingArticle ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedValues),
      });

      if (response.ok) {
        message.success(`Blog article ${editingArticle ? 'updated' : 'created'} successfully`);
        setIsModalVisible(false);
        form.resetFields();
        setFileList([]);
        fetchArticles();
      } else {
        message.error(`Failed to ${editingArticle ? 'update' : 'create'} blog article`);
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
      ellipsis: true,
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => category || 'Uncategorized',
    },
    {
      title: 'Published',
      dataIndex: 'isPublished',
      key: 'isPublished',
      render: (isPublished: boolean) => isPublished ? 'Yes' : 'No',
    },
    {
      title: 'Date',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: BlogArticle, b: BlogArticle) => {
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: BlogArticle) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Delete this article?"
            description="Are you sure you want to delete this blog article?"
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

  const categories = [
    'Technology',
    'Business',
    'Design',
    'Development',
    'Marketing',
    'News',
    'Other'
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
        <Title level={2}>Blog Articles</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
        >
          Add Article
        </Button>
      </div>

      <Table 
        dataSource={articles} 
        columns={columns} 
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={`${editingArticle ? 'Edit' : 'Add'} Blog Article`}
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
            {editingArticle ? 'Update' : 'Create'}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="blogForm"
          initialValues={{ isPublished: false }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="author"
            label="Author"
            rules={[{ required: true, message: 'Please enter an author' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
          >
            <Select placeholder="Select a category">
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="excerpt"
            label="Excerpt"
          >
            <TextArea rows={2} placeholder="Brief summary of the article" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: 'Please enter content' }]}
          >
            <TextArea rows={10} />
          </Form.Item>

          <Form.Item
            name="publishedAt"
            label="Publication Date"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="isPublished"
            label="Published"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Thumbnail"
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Select Thumbnail</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}