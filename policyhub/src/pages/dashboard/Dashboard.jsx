import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import DashboardSidebar from '../../components/feature-specific/dashboard/DashboardSidebar';
import SummaryCards from '../../components/feature-specific/dashboard/SummaryCards';
import PolicyTable from '../../components/common/PolicyTable';
import PolicyModal from '../../components/common/PolicyModal';

const sidebarItems = [
  'Dashboard',
  'My Policies',
  'History',
  'Notifications',
  'Settings',
];

const categories = ['All', 'HR', 'IT', 'Compliance'];
const statuses = ['All', 'Pending', 'Signed'];

function Dashboard({ onLogout }) {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSidebar, setActiveSidebar] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchText, setSearchText] = useState('');
  const { user, logout } = useAuth();
  const [modalPolicy, setModalPolicy] = useState(null);
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [signing, setSigning] = useState(false);

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

  const filteredPolicies = useMemo(() => {
    return policies.filter((policy) => {
      const matchesCategory =
        categoryFilter === 'All' || policy.category === categoryFilter;
      const matchesStatus =
        statusFilter === 'All' || policy.status === statusFilter;
      const matchesSearch = policy.name
        .toLowerCase()
        .includes(searchText.toLowerCase());

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [policies, categoryFilter, statusFilter, searchText]);

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

  const openPolicy = (policy) => {
    setModalPolicy(policy);
    setAgreeChecked(false);
  };

  const closeModal = () => {
    setModalPolicy(null);
    setAgreeChecked(false);
    setSigning(false);
  };

  const handleSign = async () => {
    if (!modalPolicy || !agreeChecked) return;

    try {
      setSigning(true);
      await API.post('/PolicyAcknowledgments', {
        assignmentId: 1,
        userId: user?.userId,
        status: 'Signed',
        signedAt: new Date().toISOString(),
        consentText: 'I agree to the policy terms.',
      });

      setPolicies((current) =>
        current.map((policy) =>
          policy.id === modalPolicy.id
            ? {
                ...policy,
                status: 'Signed',
              }
            : policy
        )
      );

      alert('Policy signed successfully');
      setModalPolicy(null);
      setSigning(false);
    } catch (err) {
      console.log(err);
      alert('Failed to sign policy');
      setSigning(false);
    }
  };

  return (
    <div
      className={`dashboard-shell ${
        sidebarOpen ? 'sidebar-open' : 'sidebar-closed'
      }`}
    >
      <div
        className="sidebar-hover-zone"
        onMouseEnter={() => setSidebarOpen(true)}
      />

      <DashboardSidebar
        sidebarItems={sidebarItems}
        activeSidebar={activeSidebar}
        sidebarOpen={sidebarOpen}
        onSelectItem={setActiveSidebar}
        onCloseSidebar={() => setSidebarOpen(false)}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      />

      <div className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>PolicyHub Dashboard</h1>
            <p>Internal policy acknowledgment portal.</p>
          </div>

          <div className="user-card">
            <div className="user-details">
              <span>{user?.fullName || 'Employee'}</span>
              <small>Employee</small>
            </div>

            <div className="avatar">R</div>
            <button
              className="logout-btn dashboard-logout"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>

        <SummaryCards summary={summary} />

        <section className="filter-area">
          <div className="filter-group">
            <label>Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-search">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search policy"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </section>

        <section className="table-panel">
          <div className="table-panel-header">
            <h2>Assigned Policies</h2>
            <span>{filteredPolicies.length} items</span>
          </div>

          <PolicyTable
            policies={filteredPolicies}
            loading={loading}
            onViewPolicy={openPolicy}
          />
        </section>
      </div>

      <PolicyModal
        modalPolicy={modalPolicy}
        agreeChecked={agreeChecked}
        onAgreeChange={setAgreeChecked}
        onClose={closeModal}
        onSign={handleSign}
        signing={signing}
      />
    </div>
  );
}

export default Dashboard;
