import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiFileText, FiClock, FiUsers, FiLayers } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import ROUTES from '../../routes/paths';

const Sidebar = ({ collapsed }) => {
  const { user, viewPreference } = useAuth();
  const roles = user?.roles || [];
  const isAdmin = roles.some((r) => ['HRAdmin', 'SuperAdmin'].includes(r));
  
  // Show admin items based on both isAdmin and current view preference
  const showAdminItems = isAdmin && viewPreference === 'admin';
  const policyTitle = showAdminItems ? 'Policies' : 'My Policies';

  const items = [
    { to: ROUTES.dashboard, icon: FiHome, key: 'dashboard', title: 'Dashboard' },
    { to: ROUTES.policies, icon: FiFileText, key: 'policies', title: policyTitle },
    ...(showAdminItems ? [
      { to: ROUTES.assignments, icon: FiUsers, key: 'assignments', title: 'Assignments' },
      { to: ROUTES.categories, icon: FiLayers, key: 'categories', title: 'Categories' },
      { to: ROUTES.users, icon: FiUsers, key: 'users', title: 'Users' },
    ] : []),
    { to: ROUTES.history, icon: FiClock, key: 'history', title: 'History' },
  ];

  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-inner">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <NavLink
              key={it.key}
              to={it.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              aria-label={it.title}
              title={it.title}
            >
              <Icon className="sidebar-link-icon" />
              {!collapsed && <span className="sidebar-link-text">{it.title}</span>}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
