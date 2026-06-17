import React, { useEffect, useRef, useState } from 'react';
import { FiMenu, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const getInitials = (fullName) => {
  if (!fullName) return 'U';
  const parts = fullName.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const Navigation = ({ onToggleSidebar, collapsed }) => {
  const { user, logout, viewPreference, setView } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const roleLabel = user?.roles?.includes('SuperAdmin')
    ? 'SuperAdmin'
    : user?.roles?.includes('HRAdmin')
    ? 'HR Admin'
    : 'Employee';

  useEffect(() => {
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleViewSelect = (v) => {
    if (v === viewPreference) return;
    if (typeof setView === 'function') setView(v);
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/logo192.png"
            alt="C2S Logo"
            style={{ height: '40px', width: 'auto' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="app-brand">PolicyHub</div>
        </div>
      </div>

      <div className="app-header-right" ref={containerRef}>
        <div className="avatar-wrap">
          <button
            type="button"
            className="avatar-button"
            onClick={() => setOpen((s) => !s)}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="Open user menu"
          >
            <span className="avatar">{getInitials(user?.fullName || user?.name || user?.email)}</span>
          </button>

          {open && (
            <div className="user-menu" role="menu">
              <div className="user-menu-profile">
                <div className="user-menu-avatar">{getInitials(user?.fullName || user?.name || user?.email)}</div>
                <div className="user-menu-info">
                  <div className="user-menu-name">{user?.fullName || user?.name || 'User'}</div>
                  <div className="user-menu-role">{roleLabel}</div>
                  {user?.email && <div className="user-menu-email">{user.email}</div>}
                </div>
              </div>

              <div className="user-menu-section">
                <div className="view-options">
                  <button
                    type="button"
                    className={`view-option ${viewPreference === 'employee' ? 'active' : ''}`}
                    onClick={() => handleViewSelect('employee')}
                  >
                    Employee View
                  </button>
                  <button
                    type="button"
                    className={`view-option ${viewPreference === 'admin' ? 'active' : ''}`}
                    onClick={() => handleViewSelect('admin')}
                  >
                    Admin View
                  </button>
                </div>
              </div>

              <div className="menu-actions">
                <button type="button" className="menu-item logout" onClick={logout}>
                  <FiLogOut style={{ marginRight: 8 }} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navigation;
