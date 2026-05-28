import React from 'react';

const DashboardSidebar = ({
  sidebarItems,
  activeSidebar,
  sidebarOpen,
  onSelectItem,
  onCloseSidebar,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <aside
      className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="sidebar-brand">
        <div className="brand-icon">P</div>
        <div>
          <h2>Policy Portal</h2>
          <p>Employee Center</p>
        </div>
      </div>

      <button className="close-sidebar-btn" onClick={onCloseSidebar}>
        Close
      </button>

      <nav className="sidebar-nav">
        {sidebarItems.map((item) => (
          <button
            key={item}
            className={
              item === activeSidebar ? 'sidebar-item active' : 'sidebar-item'
            }
            onClick={() => onSelectItem(item)}
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
