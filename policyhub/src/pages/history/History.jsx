import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

function History() {
  const { user } = useAuth();
  const [acknowledgments, setAcknowledgments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await API.get('/PolicyAcknowledgments/me');
      if (Array.isArray(response.data)) {
        setAcknowledgments(response.data);
      } else {
        setAcknowledgments([]);
      }
    } catch (err) {
      console.error(err);
      setAcknowledgments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1>History</h1>
          <p>Review completed acknowledgments and signed policies.</p>
        </div>
      </div>

      <div className="table-panel">
        <div className="section-title">Acknowledgement History</div>
        {loading ? (
          <div className="empty-state">Loading history...</div>
        ) : acknowledgments.length === 0 ? (
          <div className="empty-state">No policy history found yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Assignment</th>
                <th>Status</th>
                <th>Signed At</th>
                <th>Consent</th>
              </tr>
            </thead>
            <tbody>
              {acknowledgments.map((ack) => (
                <tr key={ack.acknowledgmentId || `${ack.assignmentId}-${ack.userId}`}>
                  <td>{ack.assignmentTitle || ack.assignmentId}</td>
                  <td>{ack.status}</td>
                  <td>{ack.signedAt ? new Date(ack.signedAt).toLocaleString() : 'Pending'}</td>
                  <td>{ack.consentText || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default History;
