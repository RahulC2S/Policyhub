import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { showToast } from '../../utils/toast';
import PolicyTable from '../../components/common/PolicyTable';
import PolicyModal from '../../components/common/PolicyModal';
import PoliciesAdmin from '../admin/PoliciesAdmin';

const categories = ['All', 'HR', 'IT', 'Compliance'];
const statuses = ['All', 'Pending', 'Signed', 'Overdue'];

const normalizeStatusParam = (status) => {
  if (!status) return null;

  const normalized = status.toString().trim().toLowerCase();

  if (normalized === 'pending') return 'Pending';
  if (normalized === 'signed') return 'Signed';
  if (normalized === 'overdue') return 'Overdue';

  return null;
};

function Policies() {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [signing, setSigning] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { user, viewPreference } = useAuth();

  const isAdmin = user?.roles?.some((role) =>
    ['HRAdmin', 'SuperAdmin'].includes(role)
  );

  // Show admin policies only if user is admin AND in admin view
  const shouldShowAdminPolicies = isAdmin && viewPreference === 'admin';

  const fetchAssignedPolicies = async () => {
    if (!user) {
      setPolicies([]);
      setLoading(false);
      return;
    }

    try {
      const [assignResponse, ackResponse] = await Promise.all([
        API.get('/PolicyAssignments/me'),
        API.get('/PolicyAcknowledgments/me'),
      ]);

      const assignments = Array.isArray(assignResponse.data) ? assignResponse.data : [];
      const acknowledgments = Array.isArray(ackResponse.data) ? ackResponse.data : [];

      // Build map of signed assignments for quick lookup
      const signedAssignmentIds = new Set(acknowledgments.map(ack => ack.assignmentId));

      const mapped = assignments.map((assignment) => {
        const policy = assignment.policy || assignment;
        const isSigned = signedAssignmentIds.has(assignment.assignmentId);

        return {
          id: assignment.assignmentId || assignment.policyId || policy.policyId,
          assignmentId: assignment.assignmentId,
          name: assignment.title || policy.title || assignment.policyTitle || 'Policy',
          category: assignment.categoryName || '',
          version: assignment.version || policy.version || '1.0',
          description: assignment.description || policy.description || '',
          status: isSigned ? 'Signed' : 'Pending',
          blobUrl: assignment.blobUrl || policy.blobUrl || policy.blobPath || '',
          dueDate: assignment.dueDate || null,
          assignedDate: assignment.assignedDate || null,
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requestedStatus = normalizeStatusParam(params.get('status'));

    if (requestedStatus) {
      setStatusFilter(requestedStatus);
    }
  }, [location.search]);

  const filteredPolicies = useMemo(() => {
    const now = new Date();

    return [...policies]
      .sort((a, b) => {
        const aDate = a.assignedDate ? new Date(a.assignedDate).getTime() : 0;
        const bDate = b.assignedDate ? new Date(b.assignedDate).getTime() : 0;
        return bDate - aDate;
      })
      .filter((policy) => {
        const matchesCategory =
          categoryFilter === 'All' || policy.category === categoryFilter;

        let matchesStatus = true;
        if (statusFilter === 'Pending') {
          matchesStatus = policy.status === 'Pending';
        } else if (statusFilter === 'Signed') {
          matchesStatus = policy.status === 'Signed';
        } else if (statusFilter === 'Overdue') {
          matchesStatus =
            policy.status === 'Pending' &&
            policy.dueDate &&
            new Date(policy.dueDate) < now;
        }

        const matchesSearch = policy.name
          .toLowerCase()
          .includes(searchText.toLowerCase());

        return matchesCategory && matchesStatus && matchesSearch;
      });
  }, [policies, categoryFilter, statusFilter, searchText]);

  if (shouldShowAdminPolicies) {
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

  const clearFilters = () => {
    setCategoryFilter('All');
    setStatusFilter('All');
    setSearchText('');
  };

  const handleSign = async () => {
    if (!selectedPolicy || !agreeChecked || selectedPolicy.status === 'Signed') return;

    try {
      setSigning(true);
      await API.post('/PolicyAcknowledgments/sign', {
        assignmentId: selectedPolicy.assignmentId || selectedPolicy.id || 1,
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
      setSigning(false);
      if (err.response?.status === 409) {
        showToast('This policy has already been signed by you.', 'warning');
        closeModal();
        await fetchAssignedPolicies();
      } else {
        console.error(err);
        showToast('Failed to sign policy. Please try again.', 'error');
      }
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

          <div className="filter-group" style={{ marginRight: '1rem' }}>
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

          <div className="filter-actions">
            <button type="button" className="secondary-button" onClick={clearFilters}>
              Clear filters
            </button>
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