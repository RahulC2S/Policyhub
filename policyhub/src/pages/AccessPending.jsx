import React from 'react';
import appConfig from '../config/appConfig';
import { useAuth } from '../context/AuthContext';

const AccessPending = () => {
  const { logout, refreshUser, loading } = useAuth();

  return (
    <div className="pending-page">
      <div className="pending-card">
        <div className="pending-icon">🔒</div>
        <h1>Your account is awaiting access</h1>
        <p>
          You have successfully signed in, but no application role has been assigned to your
          account yet.
        </p>
        <p className="pending-details">
          Please contact a PolicyHub administrator to request access.
        </p>
        {appConfig.adminContactEmail ? (
          <p className="pending-contact">
            Admin contact: <a href={`mailto:${appConfig.adminContactEmail}`}>{appConfig.adminContactEmail}</a>
          </p>
        ) : null}
        <div className="pending-actions">
          <button className="login-btn secondary" onClick={refreshUser} disabled={loading}>
            Refresh Access
          </button>
          <button className="login-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessPending;
