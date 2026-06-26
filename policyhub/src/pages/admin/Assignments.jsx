import { useEffect, useMemo, useRef, useState } from 'react';
import API from '../../services/api';

function PolicyMultiSelect({
  label,
  policies,
  selectedPolicies,
  onSelectionChange,
  loading,
  error,
  helperText,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const filteredPolicies = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return policies.filter((policy) => {
      const title = (policy.title || `Policy ${policy.policyId}`).toLowerCase();
      return query.length === 0 || title.includes(query);
    });
  }, [policies, searchText]);

  const selectedCount = selectedPolicies.length;
  const allSelected = policies.length > 0 && selectedPolicies.length === policies.length;

  const selectedDisplay = useMemo(() => {
    if (selectedCount === 0) {
      return '';
    }

    const selectedTitles = selectedPolicies.map((policy) => policy.title || `Policy ${policy.policyId}`);

    if (selectedCount === 1) {
      return selectedTitles[0];
    }

    if (selectedCount === 2) {
      return `${selectedTitles[0]}, ${selectedTitles[1]}`;
    }

    if (selectedCount <= 4) {
      return `${selectedTitles.slice(0, 2).join(', ')} + ${selectedCount - 2} more`;
    }

    return `${selectedCount} policies selected`;
  }, [selectedPolicies, selectedCount]);

  const togglePolicy = (policy) => {
    const isSelected = selectedPolicies.some((selectedPolicy) => selectedPolicy.policyId === policy.policyId);
    const nextPolicies = isSelected
      ? selectedPolicies.filter((selectedPolicy) => selectedPolicy.policyId !== policy.policyId)
      : [...selectedPolicies, policy];

    onSelectionChange(nextPolicies);
  };

  const toggleAll = () => {
    onSelectionChange(allSelected ? [] : [...policies]);
  };

  const handleDropdownKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev + 1 >= filteredPolicies.length ? 0 : prev + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 < 0 ? filteredPolicies.length - 1 : prev - 1));
    } else if (event.key === 'Enter' && highlightedIndex >= 0 && filteredPolicies[highlightedIndex]) {
      event.preventDefault();
      togglePolicy(filteredPolicies[highlightedIndex]);
    } else if (event.key === ' ' && highlightedIndex >= 0 && filteredPolicies[highlightedIndex]) {
      event.preventDefault();
      togglePolicy(filteredPolicies[highlightedIndex]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div className="assignment-field" ref={dropdownRef}>
      <label htmlFor="policy-search">{label}</label>
      <div className="selection-shell">
        <div className="selection-field">
          <input
            id="policy-search"
            type="text"
            readOnly
            value={selectedDisplay}
            placeholder={loading ? 'Loading policies...' : 'Select policies'}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setIsOpen(true);
              } else if (event.key === 'Escape') {
                event.preventDefault();
                setIsOpen(false);
              }
            }}
          />
          <span className={`selection-caret${isOpen ? ' is-open' : ''}`}>▾</span>
        </div>
        {isOpen && (
          <div className="selection-dropdown" role="listbox">
            <div className="selection-search">
              <input
                ref={searchInputRef}
                type="text"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                onKeyDown={handleDropdownKeyDown}
                placeholder="Search policies"
                autoComplete="off"
              />
            </div>
            <label className="selection-select-all">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                onKeyDown={(event) => {
                  if (event.key === ' ') {
                    event.preventDefault();
                    toggleAll();
                  }
                }}
              />
              <span>Select all</span>
            </label>
            <div className="selection-options">
              {filteredPolicies.length > 0 ? (
                filteredPolicies.map((policy, index) => {
                  const isSelected = selectedPolicies.some((selectedPolicy) => selectedPolicy.policyId === policy.policyId);
                  return (
                    <label
                      key={policy.policyId}
                      className={`selection-option${highlightedIndex === index ? ' is-highlighted' : ''}`}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => togglePolicy(policy)}
                        onKeyDown={(event) => {
                          if (event.key === ' ' || event.key === 'Enter') {
                            event.preventDefault();
                            togglePolicy(policy);
                          }
                        }}
                      />
                      <span>{policy.title || `Policy ${policy.policyId}`}</span>
                    </label>
                  );
                })
              ) : (
                <div className="selection-empty">No policies match your search.</div>
              )}
            </div>
          </div>
        )}
      </div>
      <p className="field-note">{error || helperText}</p>
    </div>
  );
}

function UserAutocomplete({
  label,
  users,
  selectedUserId,
  searchText,
  onSearchChange,
  onSelectUser,
  onFocus,
  onBlur,
  showSuggestions,
  loading,
  error,
  helperText,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return users.filter((user) => {
      const fullName = (user.fullName || user.name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      return query.length === 0 || fullName.includes(query) || email.includes(query);
    });
  }, [users, searchText]);

  const selectedUser = users.find((user) => user.userId === selectedUserId);
  const selectedDisplay = selectedUser ? (selectedUser.fullName || selectedUser.name || selectedUser.email || `User ${selectedUser.userId}`) : '';

  const handleSelectUser = (user) => {
    onSelectUser(user);
    setIsOpen(false);
  };

  const handleDropdownKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev + 1 >= filteredUsers.length ? 0 : prev + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 < 0 ? filteredUsers.length - 1 : prev - 1));
    } else if (event.key === 'Enter' && highlightedIndex >= 0 && filteredUsers[highlightedIndex]) {
      event.preventDefault();
      handleSelectUser(filteredUsers[highlightedIndex]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div className="assignment-field" ref={dropdownRef}>
      <label htmlFor="user-search">{label}</label>
      <div className="selection-shell">
        <div className="selection-field">
          <input
            id="user-search"
            type="text"
            readOnly
            value={selectedDisplay}
            placeholder={loading ? 'Loading users...' : 'Select user'}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' || event.key === 'Enter') {
                event.preventDefault();
                setIsOpen(true);
              } else if (event.key === 'Escape') {
                event.preventDefault();
                setIsOpen(false);
              }
            }}
          />
          <span className={`selection-caret${isOpen ? ' is-open' : ''}`}>▾</span>
        </div>
        {isOpen && (
          <div className="selection-dropdown" role="listbox">
            <div className="selection-search">
              <input
                ref={searchInputRef}
                type="text"
                value={searchText}
                onChange={(event) => onSearchChange(event.target.value)}
                onKeyDown={handleDropdownKeyDown}
                placeholder="Search user by name or email"
                autoComplete="off"
              />
            </div>
            <div className="selection-options">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <div
                    key={user.userId}
                    className={`selection-user-option${highlightedIndex === index ? ' is-highlighted' : ''}`}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => handleSelectUser(user)}
                    role="option"
                    aria-selected={selectedUser?.userId === user.userId}
                  >
                    <span className="user-name">{user.fullName || user.name || user.email || `User ${user.userId}`}</span>
                    {user.email && <span className="user-email">{user.email}</span>}
                  </div>
                ))
              ) : (
                <div className="selection-empty">No users match your search.</div>
              )}
            </div>
          </div>
        )}
      </div>
      <p className="field-note">{error || helperText}</p>
    </div>
  );
}

function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [policyError, setPolicyError] = useState('');
  const [userError, setUserError] = useState('');
  const [assignmentError, setAssignmentError] = useState('');
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
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

  const selectUser = (user) => {
    handleChange('userId', user.userId);
    setUserSearch(user.fullName || user.name || user.email || `User ${user.userId}`);
    setShowUserSuggestions(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (selectedPolicies.length === 0 || !form.userId || !form.dueDate) {
      alert('At least one policy, a user, and a due date are required.');
      return;
    }

    try {
      for (const policy of selectedPolicies) {
        await API.post('/PolicyAssignments', {
          policyId: Number(policy.policyId),
          assignedToUserId: Number(form.userId),
          assignedToDepartmentId: null,
          dueDate: form.dueDate,
          isMandatory: form.isMandatory,
        });
      }

      await loadData();
      setSelectedPolicies([]);
      setUserSearch('');
      setShowUserSuggestions(false);
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
      status: assignment.status || 'Pending',
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
            <div className="empty-state form-status">
              {policyError || userError || assignmentError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="form-panel assignment-form">
            <PolicyMultiSelect
              label="Policy"
              policies={policies}
              selectedPolicies={selectedPolicies}
              onSelectionChange={setSelectedPolicies}
              loading={loading}
              error={policyError}
              helperText={!loading && !policyError ? `${policies.length} policies available` : ''}
            />

            <UserAutocomplete
              label="User"
              users={users}
              selectedUserId={form.userId}
              searchText={userSearch}
              onSearchChange={(value) => {
                setUserSearch(value);
                if (!value) {
                  handleChange('userId', '');
                }
              }}
              onSelectUser={selectUser}
              onFocus={() => setShowUserSuggestions(true)}
              onBlur={() => window.setTimeout(() => setShowUserSuggestions(false), 150)}
              showSuggestions={showUserSuggestions}
              loading={loading}
              error={userError}
              helperText={!loading && !userError ? `${users.length} users available` : ''}
            />

            <div className="assignment-field">
              <label htmlFor="due-date">Due date</label>
              <input
                id="due-date"
                type="date"
                value={form.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                required
              />
              <p className="field-note">Select a due date</p>
            </div>

            <label className="checkbox-label assignment-form__checkbox">
              <input type="checkbox" checked={form.isMandatory} onChange={(e) => handleChange('isMandatory', e.target.checked)} />
              <span>Mark as mandatory</span>
            </label>
              <div>
            <button type="submit" className="assignment-form__button">
              Assign Policies
            </button>
            </div>
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
                        <td>
                          <span className={`status-pill ${String(row.status || 'Pending').toLowerCase()}`}>
                            {row.status || 'Pending'}
                          </span>
                        </td>
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
