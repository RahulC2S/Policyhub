import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import SummaryCards from '../../components/feature-specific/dashboard/SummaryCards';
import AdminDashboard from '../admin/AdminDashboard';

// Sidebar is global; per-page sidebar items removed to avoid duplication.

function Dashboard({ onLogout }) {
  const [assignments, setAssignments] = useState([]);
  const [acknowledgments, setAcknowledgments] = useState([]);
  const { user } = useAuth();
  const isAdmin = user?.roles?.some((role) =>
    ['HRAdmin', 'SuperAdmin'].includes(role)
  );

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) {
      return;
    }

    try {
      const [assignRes, ackRes] = await Promise.all([
        API.get('/PolicyAssignments/me'),
        API.get('/PolicyAcknowledgments/me'),
      ]);

      setAssignments(Array.isArray(assignRes.data) ? assignRes.data : []);
      setAcknowledgments(Array.isArray(ackRes.data) ? ackRes.data : []);
    } catch (err) {
      console.error(err);
      setAssignments([]);
      setAcknowledgments([]);
    }
  };

  const summary = useMemo(() => {
    const signedAssignmentIds = new Set(acknowledgments.map(ack => ack.assignmentId));
    const now = new Date();

    let pending = 0;
    let signed = 0;
    let overdue = 0;

    assignments.forEach((assignment) => {
      const isSigned = signedAssignmentIds.has(assignment.assignmentId);

      if (isSigned) {
        signed++;
      } else {
        pending++;
        // Check if overdue
        if (assignment.dueDate && new Date(assignment.dueDate) < now) {
          overdue++;
        }
      }
    });

    return { pending, signed, overdue };
  }, [assignments, acknowledgments]);

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
