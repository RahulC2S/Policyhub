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
    <div>
      <h2>Users</h2>
      <ul>
        {users.map(u => (
          <li key={u.userId}>
            {u.fullName} - {u.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Users;