import { useEffect, useState } from 'react';
import { FiShield, FiFileText, FiUsers } from 'react-icons/fi';
import API from '../../services/api';

function AdminDashboard() {
  const [policyCount, setPolicyCount] = useState(0);
  const [assignmentCount, setAssignmentCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [latestPolicies, setLatestPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [policiesRes, assignmentsRes, usersRes] = await Promise.all([
        API.get('/Policies'),
        API.get('/PolicyAssignments'),
        API.get('/Users'),
      ]);

      const policies = Array.isArray(policiesRes.data) ? policiesRes.data : [];
      const assignments = Array.isArray(assignmentsRes.data) ? assignmentsRes.data : [];
      const users = Array.isArray(usersRes.data) ? usersRes.data : [];

      setPolicyCount(policies.length);
      setAssignmentCount(assignments.length);
      setUserCount(users.length);
      setLatestPolicies(
        policies
          .slice()
          .sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()))
          .slice(0, 5)
      );
    } catch (error) {
      console.error('AdminDashboard load failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1>SuperAdmin Dashboard</h1>
          <p>Manage policies, assignments, categories, and user workflows from one place.</p>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading dashboard...</div>
      ) : (
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-icon"> <FiFileText /> </div>
            <div>
              <strong>{policyCount}</strong>
              <p>Total policies</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="card-icon"> <FiShield /> </div>
            <div>
              <strong>{assignmentCount}</strong>
              <p>Policy assignments</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="card-icon"> <FiUsers /> </div>
            <div>
              <strong>{userCount}</strong>
              <p>Active users</p>
            </div>
          </div>
        </div>
      )}

      <div className="card-panel" style={{ marginTop: '1.5rem' }}>
        <div className="section-title">Recent policies</div>
        {latestPolicies.length === 0 ? (
          <div className="empty-state">No recent policies available.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {latestPolicies.map((policy) => (
                  <tr key={policy.policyId}>
                    <td>{policy.title}</td>
                    <td>{policy.category || 'General'}</td>
                    <td>{policy.isActive ? 'Active' : 'Inactive'}</td>
                    <td>{new Date(policy.createdAt || Date.now()).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
