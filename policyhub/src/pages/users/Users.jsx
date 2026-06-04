import { useEffect, useState } from 'react';
import API from '../../services/api';

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    API.get('/Users')
      .then((res) => setUsers(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p>Manage your organization members and role assignments.</p>
        </div>
      </div>

      <div className="table-panel">
        <div className="section-title">User Directory</div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.userId}>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td>{u.roleName || 'Employee'}</td>
                <td>{u.isActive ? 'Active' : 'Inactive'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;