import { useEffect, useMemo, useState } from 'react';
import API from '../../services/api';

function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [policyError, setPolicyError] = useState('');
  const [userError, setUserError] = useState('');
  const [assignmentError, setAssignmentError] = useState('');
  const [form, setForm] = useState({ policyId: '', userId: '', dueDate: '', isMandatory: true });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setPolicyError('');
    setUserError('');
    setAssignmentError('');

    const results = await Promise.allSettled([
      API.get('/PolicyAssignments'),
      API.get('/Policies'),
      API.get('/Users'),
    ]);

    const [assignmentsRes, policiesRes, usersRes] = results;

    if (assignmentsRes.status === 'fulfilled') {
      setAssignments(Array.isArray(assignmentsRes.value.data) ? assignmentsRes.value.data : []);
    } else {
      console.error(assignmentsRes.reason);
      setAssignments([]);
      setAssignmentError('Unable to load assignments.');
    }

    if (policiesRes.status === 'fulfilled') {
      setPolicies(Array.isArray(policiesRes.value.data) ? policiesRes.value.data : []);
    } else {
      console.error(policiesRes.reason);
      setPolicies([]);
      setPolicyError('Unable to load policies.');
    }

    if (usersRes.status === 'fulfilled') {
      setUsers(Array.isArray(usersRes.value.data) ? usersRes.value.data : []);
    } else {
      console.error('Users load failed', usersRes.reason);
      const message = usersRes.reason?.response?.data
        ? typeof usersRes.reason.response.data === 'string'
          ? usersRes.reason.response.data
          : JSON.stringify(usersRes.reason.response.data)
        : usersRes.reason?.message || 'Unable to load users.';
      setUsers([]);
      setUserError(message);
    }

    setLoading(false);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.policyId || !form.userId || !form.dueDate) {
      alert('Policy, user, and due date are required.');
      return;
    }

    try {
      await API.post('/PolicyAssignments', {
        policyId: Number(form.policyId),        
        assignedToUserId: Number(form.userId),
        assignedToDepartmentId: null,
        dueDate: form.dueDate,
        isMandatory: form.isMandatory,
      });
      await loadData();
      setForm({ policyId: '', userId: '', dueDate: '', isMandatory: true });
    } catch (err) {
      console.error('Assignment creation failed', err);
      const response = err?.response;
      const message = response?.data
        ? typeof response.data === 'string'
          ? response.data
          : JSON.stringify(response.data)
        : err?.message || 'Unable to create assignment.';
      alert(`Unable to create assignment: ${message}`);
    }
  };

  const assignmentRows = useMemo(() => {
    return assignments.map((assignment) => ({
      id: assignment.assignmentId,
      policyTitle: assignment.policyTitle || assignment.policy?.title || 'Unknown',
      assignedTo: assignment.assignedToUser || assignment.assignedToUserId || 'Unassigned',
      dueDate: assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '-',
      mandatory: assignment.isMandatory ? 'Yes' : 'No',
      status: assignment.acknowledgments ? `${assignment.acknowledgments} acknowledgments` : 'Pending',
    }));
  }, [assignments]);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1>Policy Assignments</h1>
          <p>Assign policies to employees and track completion status.</p>
        </div>
      </div>

      <div className="card-grid assignments-grid">
        <div className="card-panel card-panel--medium">
          <div className="section-title">Create Assignment</div>
          {(policyError || userError || assignmentError) && (
            <div className="empty-state" style={{ padding: '1rem 1.25rem', marginBottom: '1rem' }}>
              {policyError || userError || assignmentError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="form-panel assignment-form">
            <label>
              Policy
              <select value={form.policyId} onChange={(e) => handleChange('policyId', e.target.value)} required>
                {loading ? (
                  <option value="" disabled>
                    Loading policies...
                  </option>
                ) : policyError ? (
                  <option value="" disabled>
                    {policyError}
                  </option>
                ) : policies.length === 0 ? (
                  <option value="" disabled>
                    No policies available
                  </option>
                ) : (
                  <>
                    <option value="" disabled>
                      Select policy
                    </option>
                    {policies.map((policy) => (
                      <option key={policy.policyId} value={policy.policyId}>
                        {policy.title || `Policy ${policy.policyId}`}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {!loading && !policyError && <p className="field-note">{policies.length} policies available</p>}
            </label>

            <label>
              User
              <select value={form.userId} onChange={(e) => handleChange('userId', e.target.value)} required>
                {loading ? (
                  <option value="" disabled>
                    Loading users...
                  </option>
                ) : userError ? (
                  <option value="" disabled>
                    {userError}
                  </option>
                ) : users.length === 0 ? (
                  <option value="" disabled>
                    No users available
                  </option>
                ) : (
                  <>
                    <option value="" disabled>
                      Select user
                    </option>
                    {users.map((user) => (
                      <option key={user.userId} value={user.userId}>
                        {user.fullName || user.name || user.email || `User ${user.userId}`}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {!loading && !userError && <p className="field-note">{users.length} users available</p>}
            </label>

            <label>
              Due date
              <input type="date" value={form.dueDate} onChange={(e) => handleChange('dueDate', e.target.value)} required />
            </label>

            <label className="checkbox-label">
              <input type="checkbox" checked={form.isMandatory} onChange={(e) => handleChange('isMandatory', e.target.checked)} />
              Mark as mandatory
            </label>

            <button type="submit">Create Assignment</button>
          </form>
        </div>

        <div className="table-panel assignments-table-panel">
          <div className="section-title">Current Assignments</div>
          {loading ? (
            <div className="empty-state">Loading assignments…</div>
          ) : (
            <div className="table-responsive">
              <table className="assignments-table">
                <thead>
                  <tr>
                    <th>Policy</th>
                    <th>User</th>
                    <th>Due Date</th>
                    <th>Mandatory</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignmentRows.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-state">
                        No assignments found.
                      </td>
                    </tr>
                  ) : (
                    assignmentRows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.policyTitle}</td>
                        <td>{row.assignedTo}</td>
                        <td>{row.dueDate}</td>
                        <td>{row.mandatory}</td>
                        <td>{row.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Assignments;
