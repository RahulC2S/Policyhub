import { useEffect, useState } from 'react';
import API from '../../services/api';

function Policies() {
  const [policies, setPolicies] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await API.get('/Policies');

      console.log('API RESPONSE => ', response.data);

      if (Array.isArray(response.data)) {
        setPolicies(response.data);
      } else {
        setPolicies([]);
      }
    } catch (error) {
      console.error(error);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  const openPdf = (url, title) => {
    if (!url) {
      alert("PDF URL not found");
      return;
    }

    setSelectedPdf(url);
    setSelectedTitle(title);
  };

  return (
    <div
      style={{
        padding: "30px",
        backgroundColor: "#f5f7fb",
        minHeight: "100vh",
        fontFamily: "Arial",
      }}
    >
      <h1
        style={{
          marginBottom: "20px",
          color: "#1e293b",
        }}
      >
        📄 Assigned Policies
      </h1>

      {loading ? (
        <h3>Loading...</h3>
      ) : (
        <>
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                marginBottom: "20px",
              }}
            >
              Total Policies: {policies.length}
            </h3>

            <table
              width="100%"
              cellPadding="12"
              style={{
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#0f172a",
                    color: "white",
                  }}
                >
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {policies.length > 0 ? (
                  policies.map((policy) => (
                    <tr
                      key={policy.policyId}
                      style={{
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      <td>{policy.policyId}</td>

                      <td>{policy.title}</td>

                      <td>{policy.category}</td>

                      <td>{policy.description}</td>

                      <td>
                        {policy.isActive ? (
                          <span
                            style={{
                              color: "green",
                              fontWeight: "bold",
                            }}
                          >
                            Active
                          </span>
                        ) : (
                          <span
                            style={{
                              color: "red",
                              fontWeight: "bold",
                            }}
                          >
                            Inactive
                          </span>
                        )}
                      </td>

                      <td>
                        <button
                          onClick={() =>
                            openPdf(
                              policy.blobUrl,
                              policy.title
                            )
                          }
                          style={{
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            padding: "8px 14px",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          View PDF
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        textAlign: "center",
                        padding: "20px",
                      }}
                    >
                      No Policies Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {selectedPdf && (
            <div
              style={{
                marginTop: "30px",
                background: "white",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <h2>{selectedTitle}</h2>

                <button
                  onClick={() => setSelectedPdf("")}
                  style={{
                    background: "red",
                    color: "white",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>

              <iframe
                src={selectedPdf}
                title="Policy PDF"
                width="100%"
                height="700px"
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "10px",
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Policies;