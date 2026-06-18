import React from 'react';

const FullScreenLoader = ({
  title = 'Signing you in...',
  message = 'Please wait while we load your account and permissions.',
}) => {
  return (
    <div className="auth-loader">
      <div className="auth-loader-card">
        <div className="auth-loader-spinner" aria-hidden="true" />
        <div className="auth-loader-text">
          <h1>{title}</h1>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default FullScreenLoader;
