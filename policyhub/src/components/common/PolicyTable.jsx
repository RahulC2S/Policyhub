import React from 'react';

const PolicyTable = ({ policies, loading, onViewPolicy }) => {
  if (loading) {
    return <div className="table-loading">Loading policies...</div>;
  }

  return (
    <table className="policy-table">
      <thead>
        <tr>
          <th>Policy</th>
          <th>Category</th>
          <th>Version</th>
          <th>Due Date</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {policies.length === 0 ? (
          <tr>
            <td colSpan="6" className="empty-state">
              No assigned policies found.
            </td>
          </tr>
        ) : (
          policies.map((policy) => (
            <tr key={policy.id || policy.name}>
              <td>{policy.name}</td>
              <td>{policy.category}</td>
              <td>{policy.version}</td>
              <td>
                {policy.dueDate
                  ? new Date(policy.dueDate).toLocaleDateString()
                  : '-'}
              </td>
              <td>
                <span className={`status-pill ${String(policy.status || 'Pending').toLowerCase()}`}>
                  {policy.status || 'Pending'}
                </span>
              </td>
              <td>
                <button
                  className="action-btn"
                  onClick={() => onViewPolicy(policy)}
                >
                  {policy.status === 'Pending' ? 'View & Sign' : 'View'}
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default PolicyTable;
