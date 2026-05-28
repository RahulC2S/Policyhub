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
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {policies.map((policy) => (
          <tr key={policy.id}>
            <td>{policy.name}</td>
            <td>{policy.category}</td>
            <td>{policy.version}</td>
            <td>
              <span className={`status-pill ${policy.status.toLowerCase()}`}>
                {policy.status}
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
        ))}
      </tbody>
    </table>
  );
};

export default PolicyTable;
