import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import PolicyTable from '../../components/common/PolicyTable';
import PolicyModal from '../../components/common/PolicyModal';
import PoliciesAdmin from '../admin/PoliciesAdmin';

const categories = ['All', 'HR', 'IT', 'Compliance'];
const statuses = ['All', 'Pending', 'Signed'];

function Policies() {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [signing, setSigning] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const isAdmin = user?.roles?.some((role) =>
    ['HRAdmin', 'SuperAdmin'].includes(role)
  );

  const fetchAssignedPolicies = async () => {
    if (!user) {
      setPolicies([]);
      setLoading(false);
      return;
    }

    try {
      const response = await API.get('/PolicyAssignments/me');
      const assignments = Array.isArray(response.data) ? response.data : [];

      const mapped = assignments.map((assignment) => {
        const policy = assignment.policy || assignment;
        const statusValue =
          assignment.status ||
          assignment.assignmentStatus ||
          (assignment.acknowledgments?.length > 0 ? 'Signed' : 'Pending') ||
          (policy.isActive === false ? 'Signed' : 'Pending');

        return {
          id: assignment.assignmentId || assignment.policyId || policy.policyId,
          assignmentId: assignment.assignmentId,
          name: assignment.title || policy.title || assignment.policyTitle || 'Policy',
          category: assignment.category || policy.category || 'General',
          version: assignment.version || policy.version || '1.0',
          description: assignment.description || policy.description || '',
          status: statusValue,
          blobUrl: assignment.blobUrl || policy.blobUrl || policy.blobPath || '',
        };
      });

      setPolicies(mapped);
    } catch (error) {
      console.error(error);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedPolicies();
  }, [user]);

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

  if (isAdmin) {
    return <PoliciesAdmin />;
  }

  const openPolicy = (policy) => {
    setSelectedPolicy(policy);
    setAgreeChecked(false);
  };

  const closeModal = () => {
    setSelectedPolicy(null);
    setAgreeChecked(false);
    setSigning(false);
  };

  const handleSign = async () => {
    if (!selectedPolicy || !agreeChecked) return;

    try {
      setSigning(true);
      await API.post('/PolicyAcknowledgments', {
        assignmentId: selectedPolicy.assignmentId || selectedPolicy.id || 1,
        userId: user?.userId,
        status: 'Signed',
        signedAt: new Date().toISOString(),
        consentText: 'I agree to the policy terms.',
      });

      setPolicies((current) =>
        current.map((policy) =>
          policy.id === selectedPolicy.id
            ? { ...policy, status: 'Signed' }
            : policy
        )
      );

      closeModal();
      setSigning(false);
    } catch (err) {
      console.error(err);
      alert('Failed to sign policy');
      setSigning(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1>Assigned Policies</h1>
          <p>View, filter, and sign your assigned policies.</p>
        </div>
      </div>

      <div className="card-panel">
        <div className="table-panel-header">
          <div>
            <div className="section-title">Assigned Policies</div>
            <p style={{ margin: '0.4rem 0 0', color: '#6b7280' }}>
              {policies.length} items assigned
            </p>
          </div>
          <span>{filteredPolicies.length} items shown</span>
        </div>

        <section className="filter-area" style={{ marginBottom: '1rem' }}>
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

        <PolicyTable
          policies={filteredPolicies}
          loading={loading}
          onViewPolicy={openPolicy}
        />
      </div>

      <PolicyModal
        modalPolicy={selectedPolicy}
        agreeChecked={agreeChecked}
        onAgreeChange={setAgreeChecked}
        onClose={closeModal}
        onSign={handleSign}
        signing={signing}
      />
    </div>
  );
}

export default Policies;