"use client";

import { useState, useEffect } from 'react';
import { Layout, Menu, Button, theme, Avatar, Dropdown } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  FileTextOutlined,
  ProjectOutlined,
  TeamOutlined,
  UserOutlined,
  MailOutlined,
  RiseOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import Link from 'next/link';

const { Header, Sider, Content } = Layout;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { token } = theme.useToken();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link href="/admin">Dashboard</Link>,
    },
    {
      key: '/admin/services',
      icon: <FileTextOutlined />,
      label: <Link href="/admin/services">Services</Link>,
    },
    {
      key: '/admin/case-studies',
      icon: <ProjectOutlined />,
      label: <Link href="/admin/case-studies">Case Studies</Link>,
    },
    {
      key: '/admin/blog',
      icon: <FileTextOutlined />,
      label: <Link href="/admin/blog">Blog</Link>,
    },
    {
      key: '/admin/jobs',
      icon: <RiseOutlined />,
      label: <Link href="/admin/jobs">Jobs</Link>,
    },
    {
      key: '/admin/partners',
      icon: <TeamOutlined />,
      label: <Link href="/admin/partners">Partners</Link>,
    },
    {
      key: '/admin/clients',
      icon: <TeamOutlined />,
      label: <Link href="/admin/clients">Clients</Link>,
    },
    {
      key: '/admin/contact-submissions',
      icon: <MailOutlined />,
      label: <Link href="/admin/contact-submissions">Contact Submissions</Link>,
    },
  ];

  const userMenuItems = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => router.push('/admin/settings'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleSignOut,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: token.colorBgContainer,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          zIndex: 999,
        }}
        theme="light"
        width={256}
      >
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">
            {collapsed ? 'XW' : 'Xcelliti Admin'}
          </h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          style={{ borderRight: 0 }}
          items={menuItems}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 256, transition: 'all 0.2s' }}>
        <Header style={{ 
          padding: 0, 
          background: token.colorBgContainer,
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <div className="flex items-center mr-4">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center cursor-pointer">
                <Avatar icon={<UserOutlined />} />
                {!collapsed && (
                  <span className="ml-2 mr-4">{session?.user?.email}</span>
                )}
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}