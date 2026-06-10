import React, { useEffect, useRef, useState } from "react";
import API from "../../services/api";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

//pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const PolicyModal = ({
  modalPolicy,
  agreeChecked,
  onAgreeChange,
  onClose,
  onSign,
  signing,
}) => {
  const [blobSrc, setBlobSrc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(1.5);

  const [accepted, setAccepted] = useState(false);
  const [canAccept, setCanAccept] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);



  const containerRef = useRef(null);

  // Load PDF
  useEffect(() => {
    let objectUrl = null;

    const loadPdf = async () => {
      if (!modalPolicy) return;

      setBlobSrc(null);
      setNumPages(0);
      setAccepted(false);
      setCanAccept(false);
      setIsLoading(true);
      setProgress(0);

      try {
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + Math.random() * 30, 90));
        }, 200);

        if (modalPolicy.assignmentId) {
          const resp = await API.get(
            `/PolicyAssignments/${modalPolicy.assignmentId}/pdf`,
            {
              responseType: "arraybuffer",
            }
          );

          const blob = new Blob([resp.data], {
            type: "application/pdf",
          });

          objectUrl = URL.createObjectURL(blob);
          clearInterval(progressInterval);
          setProgress(100);
          setBlobSrc(objectUrl);
        } else if (modalPolicy.blobUrl) {
          clearInterval(progressInterval);
          setProgress(100);
          setBlobSrc(modalPolicy.blobUrl);
        }
      } catch (err) {
        console.error("Failed to load PDF", err);
        setIsLoading(false);
      }
    };

    loadPdf();

    return () => {
      setBlobSrc(null);

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [modalPolicy]);

  // Clean up when modal closes
  useEffect(() => {
    if (!modalPolicy) {
      setBlobSrc(null);
      setNumPages(0);
      setAccepted(false);
      setCanAccept(false);
    }
  }, [modalPolicy]);

  // Reset scroll every time modal/pdf changes
  useEffect(() => {
    const container = containerRef.current;

    if (container) {
      container.scrollTop = 0;
    }

    setAccepted(false);
    setCanAccept(false);

    onAgreeChange?.(false);


  }, [blobSrc]);

  // PDF loaded
  const onLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setProgress(100);
    setIsLoading(false);

    setTimeout(() => {
      const container = containerRef.current;

      if (!container) return;

      container.scrollTop = 0;

      const handleScroll = () => {
        const reachedBottom =
          Math.ceil(
            container.scrollTop + container.clientHeight
          ) >= container.scrollHeight - 5;

        if (reachedBottom) {
          setCanAccept(true);
        }
      };

      container.addEventListener("scroll", handleScroll);
    }, 500);
  };

  if (!modalPolicy) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "95%",
          maxWidth: "1600px",
          height: "95vh",
          background: "#fff",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2>{modalPolicy.name}</h2>
            <p>{modalPolicy.category}</p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
          <button
            onClick={() =>
              setZoom((z) =>
                Math.max(0.75, z - 0.25)
              )
            }
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            −
          </button>

            <span>
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={() =>
                setZoom((z) =>
                  Math.min(3, z + 0.25)
                )
              }
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              +
            </button>

            <button
              onClick={onClose}
              style={{
                background: "#ef4444",
                color: "white",
                border: "none",
                padding: "8px 14px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {isLoading && (
          <div
            style={{
              height: "4px",
              background: "#e5e7eb",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "#2563eb",
                width: `${progress}%`,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        )}

        {/* PDF Viewer */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            overflowY: "auto",
            background: "#f1f5f9",
            padding: "20px",
          }}
        >
          {blobSrc && (
            <Document
              key={blobSrc}
              file={blobSrc}
              onLoadSuccess={onLoadSuccess}
              loading="Loading PDF..."
            >
              {Array.from(
                new Array(numPages),
                (_, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <Page
                      pageNumber={index + 1}
                      scale={zoom}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      devicePixelRatio={window.devicePixelRatio || 2}
                    />
                  </div>
                )
              )}
            </Document>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "20px",
            borderTop: "1px solid #e5e7eb",
            background: "#fff",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginTop: "10px",
            }}
          >
            <input
              type="checkbox"
              checked={accepted}
              disabled={!canAccept}
              onChange={(e) => {
                const checked = e.target.checked;
                setAccepted(checked);
                onAgreeChange?.(checked);
              }}
              style={{
                width: "22px",
                height: "22px",
                cursor: canAccept ? "pointer" : "not-allowed",
                accentColor: "#2563eb",
                flexShrink: 0,
              }}
            />

            <label
              style={{
                fontSize: "16px",
                color: "#334155",
                fontWeight: "500",
                cursor: canAccept ? "pointer" : "default",
              }}
            >
              I agree to the policy terms.
            </label>
          </div>

          <div
            style={{
              marginTop: "15px",
            }}
          >
            <button
              onClick={onSign}
              disabled={
                !accepted ||
                !canAccept ||
                signing
              }
              style={{
                background:
                  !accepted ||
                  !canAccept ||
                  signing
                    ? "#93c5fd"
                    : "#2563eb",
                color: "white",
                border: "none",
                padding: "12px 20px",
                borderRadius: "8px",
                fontWeight: "600",
                cursor:
                  !accepted ||
                  !canAccept ||
                  signing
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {signing
                ? "Signing..."
                : "Proceed to Sign"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyModal;