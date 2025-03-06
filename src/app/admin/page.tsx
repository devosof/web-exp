"use client";

import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Spin } from 'antd';
import { UserOutlined, FileTextOutlined, ProjectOutlined, MailOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface DashboardStats {
  blogCount: number;
  serviceCount: number;
  caseStudyCount: number;
  contactSubmissionCount: number;
  recentContactSubmissions: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch blog count
        const blogRes = await fetch('/api/admin/blog-articles?limit=1');
        const blogData = await blogRes.json();
        
        // Fetch service count
        const serviceRes = await fetch('/api/admin/services?limit=1');
        const serviceData = await serviceRes.json();
        
        // Fetch case study count
        const caseStudyRes = await fetch('/api/admin/case-studies?limit=1');
        const caseStudyData = await caseStudyRes.json();
        
        // Fetch contact submissions and count
        const contactRes = await fetch('/api/admin/contact-submissions?limit=5');
        const contactData = await contactRes.json();
        
        setStats({
          blogCount: blogData.total || 0,
          serviceCount: serviceData.total || 0,
          caseStudyCount: caseStudyData.total || 0,
          contactSubmissionCount: contactData.total || 0,
          recentContactSubmissions: contactData.contactSubmissions || [],
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const contactColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
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
      render: (date: string) => new Date(date).toLocaleDateString(),
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
      <Title level={2}>Dashboard</Title>
      
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Blog Articles" 
              value={stats?.blogCount || 0} 
              prefix={<FileTextOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Services" 
              value={stats?.serviceCount || 0} 
              prefix={<UserOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Case Studies" 
              value={stats?.caseStudyCount || 0} 
              prefix={<ProjectOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Contact Submissions" 
              value={stats?.contactSubmissionCount || 0} 
              prefix={<MailOutlined />} 
            />
          </Card>
        </Col>
      </Row>

      <div className="mb-8">
        <Title level={4}>Recent Contact Submissions</Title>
        <Table 
          dataSource={stats?.recentContactSubmissions} 
          columns={contactColumns} 
          rowKey="_id"
          pagination={false}
        />
      </div>
    </div>
  );
}