import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import SummaryCards from '../../components/feature-specific/dashboard/SummaryCards';
import AdminDashboard from '../admin/AdminDashboard';

// Sidebar is global; per-page sidebar items removed to avoid duplication.

const categories = ['All', 'HR', 'IT', 'Compliance'];
const statuses = ['All', 'Pending', 'Signed'];

function Dashboard({ onLogout }) {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = user?.roles?.some((role) =>
    ['HRAdmin', 'SuperAdmin'].includes(role)
  );

  useEffect(() => {
    loadPolicies();
  }, []);
  const loadPolicies = async () => {
    try {
      const res = await API.get('/Policies');

      const mappedPolicies = res.data.map((p) => ({
        id: p.policyId,
        name: p.title,
        category: p.category || 'General',
        version: '1.0',
        assignedDate: new Date(p.createdAt || new Date())
          .toISOString()
          .split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        status: p.isActive ? 'Pending' : 'Signed',
        effectiveDate: new Date(p.createdAt || new Date())
          .toISOString()
          .split('T')[0],
        details: p.description || 'No Description',
        blobUrl: p.blobUrl,
      }));

      setPolicies(mappedPolicies);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    const pending = policies.filter(
      (policy) => policy.status === 'Pending'
    ).length;
    const signed = policies.filter(
      (policy) => policy.status === 'Signed'
    ).length;
    const overdue = policies.filter(
      (policy) =>
        policy.status === 'Pending' && new Date(policy.dueDate) < new Date()
    ).length;

    return {
      pending,
      signed,
      overdue,
    };
  }, [policies]);

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1>PolicyHub Dashboard</h1>
          <p>Employee summary and status overview for your assigned policies.</p>
        </div>

        <div className="page-meta">
          <div className="user-badge small">
            <span>{user?.fullName || 'Employee'}</span>
            <small>{user?.roles?.includes('SuperAdmin') ? 'SuperAdmin' : user?.roles?.includes('HRAdmin') ? 'HR Admin' : 'Employee'}</small>
          </div>
        </div>
      </div>

      <SummaryCards summary={summary} />

      <div className="card-panel" style={{ marginTop: '1.5rem' }}>
        <div className="section-title">What to do next</div>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Use the Policies tab to view assigned documents, filter by status, and sign any pending policies.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
