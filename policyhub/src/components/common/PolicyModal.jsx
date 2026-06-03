import React, { useRef, useState, useEffect } from 'react';
import API from '../../services/api';

const PolicyModal = ({
  modalPolicy,
  onClose,
  onSign,
  signing,
}) => {
  const [zoom, setZoom] = useState(1);
  const viewerRef = useRef(null);
  const [blobSrc, setBlobSrc] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [canAccept, setCanAccept] = useState(false);
  const [scrollPrompt, setScrollPrompt] = useState('Please review the document before agreeing.');

  useEffect(() => {
    let revoked = false;
    let objectUrl = null;

    const load = async () => {
      if (!modalPolicy) return;
      setAccepted(false);
      setCanAccept(false);
      setScrollPrompt('Please review the document before agreeing.');

      if (modalPolicy.assignmentId) {
        try {
          const resp = await API.get(`/PolicyAssignments/${modalPolicy.assignmentId}/pdf`, {
            responseType: 'arraybuffer',
          });
          const uint8 = new Uint8Array(resp.data);
          const blob = new Blob([uint8], { type: resp.headers['content-type'] || 'application/pdf' });
          objectUrl = URL.createObjectURL(blob);
          if (!revoked) setBlobSrc(objectUrl + '#toolbar=0');
        } catch (e) {
          console.error('Failed to fetch assignment pdf:', e);
          setBlobSrc(null);
        }
      } else if (modalPolicy && modalPolicy.blobUrl) {
        setBlobSrc(`${modalPolicy.blobUrl}#toolbar=0`);
      }
    };

    load();

    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setBlobSrc(null);
    };
  }, [modalPolicy]);

  useEffect(() => {
    if (!blobSrc) return;

    const iframeEl = viewerRef.current;
    if (!iframeEl) return;

    let iframeWindow = null;
    let iframeDocument = null;

    const handleScroll = () => {
      try {
        iframeWindow = viewerRef.current.contentWindow;
        iframeDocument = iframeWindow?.document || viewerRef.current.contentDocument;
        const scrollTop = iframeWindow?.scrollY || iframeDocument?.documentElement?.scrollTop || iframeDocument?.body?.scrollTop || viewerRef.current.scrollTop || 0;
        const scrollHeight = iframeDocument?.documentElement?.scrollHeight || iframeDocument?.body?.scrollHeight || viewerRef.current.scrollHeight || 0;
        const innerHeight = iframeWindow?.innerHeight || iframeDocument?.documentElement?.clientHeight || iframeDocument?.body?.clientHeight || viewerRef.current.clientHeight || 0;

        if (scrollHeight && scrollTop + innerHeight >= scrollHeight - 20) {
          setCanAccept(true);
          setScrollPrompt('You have reached the end of the document. You may now confirm that you have read it.');
        }
      } catch {
        // Ignore cross-origin or PDF viewer access issues.
      }
    };

    const attachScroll = () => {
      try {
        iframeWindow = iframeEl.contentWindow;
        iframeWindow.addEventListener('scroll', handleScroll, { passive: true });
      } catch {
        // Ignore attach errors for unsupported viewers.
      }

      try {
        iframeEl.addEventListener('scroll', handleScroll, { passive: true });
      } catch {
        // Ignore attach errors for non-scrollable iframe wrappers.
      }

      try {
        iframeDocument = iframeEl.contentDocument;
        iframeDocument?.addEventListener('scroll', handleScroll, { passive: true });
      } catch {
        // Ignore attach errors for unsupported document access.
      }
    };

    attachScroll();

    return () => {
      if (iframeWindow) {
        try {
          iframeWindow.removeEventListener('scroll', handleScroll);
        } catch {
          // ignore cleanup errors
        }
      }

      try {
        iframeEl.removeEventListener('scroll', handleScroll);
      } catch {
        // ignore cleanup errors
      }

      try {
        iframeDocument?.removeEventListener('scroll', handleScroll);
      } catch {
        // ignore cleanup errors
      }
    };
  }, [blobSrc]);

  useEffect(() => {
    if (!canAccept && accepted) {
      setAccepted(false);
    }
  }, [canAccept, accepted]);

  if (!modalPolicy) return null;

  const src = modalPolicy.assignmentId
    ? `/api/PolicyAssignments/${modalPolicy.assignmentId}/pdf#toolbar=0`
    : `${modalPolicy.blobUrl}#toolbar=0`;

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
            <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>{modalPolicy.category}</p>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
                style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}
              >
                -
              </button>
              <div style={{ minWidth: 48, textAlign: 'center' }}>{Math.round(zoom * 100)}%</div>
              <button
                onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
                style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}
              >
                +
              </button>
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
        </div>

        <div
          style={{
            flex: 1,
            padding: '20px',
            overflow: 'hidden',
            background: '#e2e8f0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <iframe
            ref={viewerRef}
            src={blobSrc || src}
            title="Policy PDF"
            onLoad={() => {
              setCanAccept(true);
              setScrollPrompt('The document is ready. You may now confirm that you have read it.');
            }}
            width={`${Math.round(zoom * 100)}%`}
            height="100%"
            style={{
              border: 'none',
              borderRadius: '10px',
              background: 'white',
              maxWidth: '1400px',
            }}
          />
        </div>

        <div
          style={{
            padding: '20px',
            borderTop: '1px solid #e5e7eb',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="checkbox"
              checked={accepted}
              disabled={!canAccept}
              onChange={(event) => setAccepted(event.target.checked)}
              style={{ width: '22px', height: '22px', accentColor: '#2563eb', cursor: canAccept ? 'pointer' : 'not-allowed' }}
            />
            <label style={{ color: canAccept ? '#111827' : '#64748b', fontSize: '1rem', lineHeight: '1.4' }}>
              I have read the policy and agree to comply with its terms.
            </label>
          </div>

          <div style={{ color: '#475569', fontSize: '0.95rem' }}>{scrollPrompt}</div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={onSign}
              disabled={!!signing || !canAccept || !accepted}
              style={{
                background: !!signing || !canAccept || !accepted ? '#93c5fd' : '#2563eb',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: !!signing || !canAccept || !accepted ? 'not-allowed' : 'pointer',
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
