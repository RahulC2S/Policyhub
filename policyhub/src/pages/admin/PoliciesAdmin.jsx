import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import API from '../../services/api';
import { showToast } from '../../utils/toast';

function PoliciesAdmin() {
  const [policies, setPolicies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', categoryId: '', isActive: true, blobPath: '' });
  const [fileUploadStatus, setFileUploadStatus] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    // only attempt to load admin data if user is an admin
    const isAdmin = user?.roles?.some((r) => ['HRAdmin', 'SuperAdmin'].includes(r));
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [policiesRes, categoriesRes] = await Promise.all([
        API.get('/Policies'),
        API.get('/Categories'),
      ]);

      setPolicies(Array.isArray(policiesRes.data) ? policiesRes.data : []);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 401) {
        showToast('Not authorized. Please sign in with an admin account.', 'error');
      } else {
        showToast('Failed to load admin data. Check console for details.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPolicy(null);
    setForm({ title: '', description: '', categoryId: '', isActive: true, blobPath: '' });
    setFileUploadStatus('');
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setFileUploadStatus('Uploading...');
      const response = await API.post('/Policies/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setForm((prev) => ({ ...prev, blobPath: response.data.blobUrl || response.data }));
      setFileUploadStatus('Upload complete');
    } catch (err) {
      console.error(err);
      setFileUploadStatus('Upload failed');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title) {
      showToast('Policy title is required', 'warning');
      return;
    }

    try {
      if (selectedPolicy) {
        await API.put(`/Policies/${selectedPolicy.policyId}`, {
          policyId: selectedPolicy.policyId,
          title: form.title,
          description: form.description,
          categoryId: form.categoryId || null,
          isActive: form.isActive,
          blobPath: form.blobPath,
        });
      } else {
        await API.post('/Policies', {
          title: form.title,
          description: form.description,
          categoryId: form.categoryId || null,
          isActive: form.isActive,
          blobPath: form.blobPath,
        });
      }

      await loadData();
      resetForm();
    } catch (error) {
      console.error(error);
      showToast('Unable to save policy.', 'error');
    }
  };

  const handleEdit = (policy) => {
    setSelectedPolicy(policy);
    setForm({
      title: policy.title || '',
      description: policy.description || '',
      categoryId: policy.categoryId || '',
      isActive: policy.isActive ?? true,
      blobPath: policy.blobPath || '',
    });
    setFileUploadStatus('');
  };

  const handleDelete = async (policyId) => {
    if (!window.confirm('Delete this policy?')) return;
    try {
      await API.delete(`/Policies/${policyId}`);
      await loadData();
      if (selectedPolicy?.policyId === policyId) resetForm();
    } catch (err) {
      console.error(err);
      showToast('Delete failed.', 'error');
    }
  };

  const policyRows = useMemo(() => {
    return policies.map((policy) => ({
      policyId: policy.policyId,
      title: policy.title,
      category: policy.category?.categoryName || policy.category || 'General',
      status: policy.isActive ? 'Active' : 'Inactive',
      createdAt: policy.createdAt ? new Date(policy.createdAt).toLocaleDateString() : '-',
    }));
  }, [policies]);

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1>Policy Management</h1>
        <p>Create, edit, upload, and delete policies for your organization.</p>
      </div>

      <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'minmax(380px, 1fr) minmax(520px, 1.4fr)' }}>
        <div style={{ minWidth: '380px', background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 14px rgba(15,23,42,0.08)' }}>
          <h2>{selectedPolicy ? 'Edit Policy' : 'Create Policy'}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
            <label>
              Title
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                style={{ width: '100%', padding: '10px', marginTop: '8px', boxSizing: 'border-box', maxWidth: '100%' }}
              />
            </label>

            <label>
              Description
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                style={{ width: '100%', padding: '10px', marginTop: '8px', boxSizing: 'border-box', maxWidth: '100%', resize: 'vertical' }}
              />
            </label>

            <label>
              Category
              <select
                value={form.categoryId ?? ''}
                onChange={(e) => handleChange('categoryId', e.target.value)}
                style={{ width: '100%', padding: '10px', marginTop: '8px', boxSizing: 'border-box', maxWidth: '100%' }}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Active
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                style={{ marginLeft: '12px' }}
              />
            </label>

            <label>
              Policy PDF Upload
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                style={{ width: '100%', marginTop: '8px', boxSizing: 'border-box', maxWidth: '100%' }}
              />
              {fileUploadStatus && (
                <div style={{ marginTop: '8px', color: '#334155' }}>{fileUploadStatus}</div>
              )}
            </label>

            {form.blobPath && (
              <div style={{ color: '#0f172a', fontSize: '14px' }}>
                PDF ready at: {form.blobPath}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" style={{ background: '#2563eb', color: 'white', padding: '12px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                {selectedPolicy ? 'Save Changes' : 'Create Policy'}
              </button>
              <button type="button" onClick={resetForm} style={{ background: '#e2e8f0', color: '#0f172a', padding: '12px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                Reset
              </button>
            </div>
          </form>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 14px rgba(15,23,42,0.08)' }}>
          <h2>Policies</h2>
          {loading ? (
            <p>Loading policies…</p>
          ) : (
            <div style={{ overflowX: 'auto', overflowY: 'hidden', paddingBottom: '1px' }}>
              <table style={{ width: '100%', minWidth: '720px', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th style={{ width: '60px', padding: '14px 18px', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>Id</th>
                    <th style={{ minWidth: '420px', padding: '14px 18px', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>Title</th>
                    <th style={{ width: '160px', padding: '14px 18px', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>Category</th>
                    <th style={{ width: '120px', padding: '14px 18px', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>Status</th>
                    <th style={{ width: '120px', padding: '14px 18px', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {policyRows.map((policy) => (
                    <tr key={policy.policyId}>
                      <td style={{ padding: '14px 18px', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{policy.policyId}</td>
                      <td style={{ padding: '14px 18px', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{policy.title}</td>
                      <td style={{ padding: '14px 18px', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{policy.category}</td>
                      <td style={{ padding: '14px 18px', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{policy.status}</td>
                      <td style={{ padding: '14px 18px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '8px', whiteSpace: 'nowrap' }}>
                        <button type="button" onClick={() => handleEdit(policies.find((item) => item.policyId === policy.policyId))} style={{ padding: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: '#f8fafc' }}>
                          <FiEdit />
                        </button>
                        <button type="button" onClick={() => handleDelete(policy.policyId)} style={{ padding: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: '#fee2e2', color: '#991b1b' }}>
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PoliciesAdmin;
