import { useEffect, useState } from 'react';
import API from '../../services/api';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState(''); // 'success' or 'error'

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await API.get('/Categories');
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);
      setStatusMessage('Failed to load categories.');
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    
    if (!newCategory.trim()) {
      setStatusMessage('Please enter a category name.');
      setStatusType('error');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('');
    setStatusType('');

    try {
      await API.post('/Categories', { categoryName: newCategory.trim() });
      setNewCategory('');
      setStatusMessage('Category created successfully!');
      setStatusType('success');
      await loadCategories();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatusMessage('');
        setStatusType('');
      }, 3000);
    } catch (err) {
      console.error(err);
      setStatusMessage(err.response?.data?.message || 'Unable to create category.');
      setStatusType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1>Category Management</h1>
          <p>Keep policy categories organized and up to date.</p>
        </div>
      </div>

      <div className="card-grid categories-grid">
        <div className="card-panel card-panel--form">
          <div className="section-title">Add Category</div>
          
          {statusMessage && (
            <div className={`status-message status-message--${statusType}`}>
              {statusMessage}
            </div>
          )}

          <form onSubmit={handleCreate} className="form-panel category-form">
            <label htmlFor="category-name">
              Category name
              <input
                id="category-name"
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter a new category name"
                disabled={isSubmitting}
                maxLength={100}
              />
            </label>
            <p className="field-note">Maximum 100 characters</p>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={isSubmitting ? 'loading' : ''}
            >
              {isSubmitting ? 'Creating...' : 'Create Category'}
            </button>
          </form>
        </div>

        <div className="card-panel card-panel--table">
          <div className="section-title">Existing Categories</div>
          
          {loading ? (
            <div className="empty-state">Loading categories…</div>
          ) : categories.length === 0 ? (
            <div className="empty-state">No categories found. Create one to get started!</div>
          ) : (
            <div className="table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.categoryId}>
                      <td>{category.categoryId}</td>
                      <td>{category.categoryName}</td>
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

export default Categories;
