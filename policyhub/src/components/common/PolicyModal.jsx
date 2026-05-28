import React from 'react';

const PolicyModal = ({
  modalPolicy,
  agreeChecked,
  onAgreeChange,
  onClose,
  onSign,
  signing,
}) => {
  if (!modalPolicy) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          width: '95%',
          maxWidth: '1700px',
          height: '95vh',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f8fafc',
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>{modalPolicy.name}</h2>
            <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>
              {modalPolicy.category}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Close
          </button>
        </div>

        <div
          style={{
            flex: 1,
            padding: '20px',
            overflow: 'hidden',
            background: '#e2e8f0',
          }}
        >
          <iframe
            src={modalPolicy.blobUrl}
            title="Policy PDF"
            width="100%"
            height="100%"
            style={{
              border: 'none',
              borderRadius: '10px',
              background: 'white',
            }}
          />
        </div>

        <div
          style={{
            padding: '20px',
            borderTop: '1px solid #e5e7eb',
            background: '#f8fafc',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
              fontWeight: '500',
            }}
          >
            <input
              type="checkbox"
              checked={agreeChecked}
              onChange={(e) => onAgreeChange(e.target.checked)}
              style={{
                width: '20px',
                height: '20px',
                minWidth: '20px',
                minHeight: '20px',
                accentColor: '#2563eb',
                border: '1px solid #94a3b8',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            />
            I agree to the policy terms and conditions.
          </label>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              disabled={!agreeChecked || signing}
              onClick={onSign}
              style={{
                background: agreeChecked ? '#2563eb' : '#94a3b8',
                color: 'white',
                border: 'none',
                padding: '2px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              {signing ? 'Signing...' : 'Proceed to Sign'}
            </button>

            <button
              onClick={onClose}
              style={{
                background: '#e2e8f0',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyModal;
