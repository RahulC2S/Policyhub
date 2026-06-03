import React from 'react';
import { FiMenu } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Navigation = ({ onToggleSidebar, collapsed }) => {
  const { user, logout } = useAuth();
  return (
    <header className="app-header">
      <div className="app-header-left">
        <button
          type="button"
          className="header-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <FiMenu />
        </button>
        <div className="app-brand">PolicyHub</div>
      </div>
      <div className="app-header-right">
        <div className="user-badge">
          <span>{user?.fullName || user?.name || 'User'}</span>
          <small>{user?.roles?.includes('SuperAdmin') ? 'SuperAdmin' : user?.roles?.includes('HRAdmin') ? 'HR Admin' : 'Employee'}</small>
        </div>
        <button type="button" className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navigation;
