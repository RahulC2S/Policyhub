import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from '../components/common/Navigation';
import Sidebar from '../components/common/Sidebar';

const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Navigation onToggleSidebar={toggleSidebar} collapsed={sidebarCollapsed} />
      <div className="app-body">
        <Sidebar collapsed={sidebarCollapsed} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
