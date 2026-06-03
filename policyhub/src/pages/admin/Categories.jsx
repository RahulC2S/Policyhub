import { useEffect, useState } from 'react';
import API from '../../services/api';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!newCategory.trim()) {
      return;
    }

    try {
      await API.post('/Categories', { categoryName: newCategory.trim() });
      setNewCategory('');
      await loadCategories();
    } catch (err) {
      console.error(err);
      alert('Unable to create category.');
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await API.delete(`/Categories/${categoryId}`);
      await loadCategories();
    } catch (err) {
      console.error(err);
      alert('Unable to delete category.');
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

      <div className="card-grid">
        <div className="card-panel">
          <div className="section-title">Add Category</div>
          <form onSubmit={handleCreate} className="form-panel" style={{ padding: 0, border: 'none', boxShadow: 'none' }}>
            <label>
              Category name
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter a new category"
              />
            </label>
            <button type="submit">Create Category</button>
          </form>
        </div>

        <div className="card-panel">
          <div className="section-title">Existing Categories</div>
          {loading ? (
            <div className="empty-state">Loading categories…</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="empty-state">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.categoryId}>
                      <td>{category.categoryId}</td>
                      <td>{category.categoryName}</td>
                      <td>
                        <button type="button" className="action-btn danger" onClick={() => handleDelete(category.categoryId)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Categories;
