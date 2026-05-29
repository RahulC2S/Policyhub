import React from 'react';
import { FiMenu } from 'react-icons/fi';

const DashboardSidebar = ({
  sidebarItems,
  activeSidebar,
  sidebarOpen,
  onSelectItem,
  onToggleSidebar,
}) => {
  return (
    <aside className={`dashboard-sidebar ${sidebarOpen ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon">P</div>
          <div className="brand-content">
            <h2>Policy Portal</h2>
            <p>Employee Center</p>
          </div>
        </div>

        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <FiMenu />
        </button>
      </div>

      <nav className="sidebar-nav">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              className={`sidebar-item ${item.key === activeSidebar ? 'active' : ''}`}
              onClick={() => onSelectItem(item.key)}
              type="button"
            >
              <span className="sidebar-icon">
                {Icon && <Icon />}
              </span>
              <span className="sidebar-text">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
