import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiChevronDown } from 'react-icons/fi';
import './ViewSwitcher.css';

const ViewSwitcher = () => {
  const { user, viewPreference, setView } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Only show for admin users
  const isAdmin = user?.roles?.some((role) =>
    ['HRAdmin', 'SuperAdmin'].includes(role)
  );

  if (!isAdmin) {
    return null;
  }

  const currentViewLabel = viewPreference === 'admin' ? 'Admin View' : 'Employee View';

  const handleViewChange = (view) => {
    setView(view);
    setIsOpen(false);
  };

  return (
    <div className="view-switcher">
      <button
        className="view-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Switch view"
      >
        <span>{currentViewLabel}</span>
        <FiChevronDown className={`chevron ${isOpen ? 'open' : ''}`} />
      </button>
      {isOpen && (
        <div className="view-switcher-menu">
          <button
            className={`view-switcher-option ${viewPreference === 'admin' ? 'active' : ''}`}
            onClick={() => handleViewChange('admin')}
          >
            Admin View
          </button>
          <button
            className={`view-switcher-option ${viewPreference === 'employee' ? 'active' : ''}`}
            onClick={() => handleViewChange('employee')}
          >
            Employee View
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewSwitcher;
