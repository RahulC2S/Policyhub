import React from 'react';

const SummaryCards = ({ summary }) => {
  return (
    <section className="summary-cards">
      <article className="summary-card">
        <div className="card-meta">
          <span className="card-icon pending">P</span>
          <div>
            <p>Pending Policies</p>
            <strong>{summary.pending}</strong>
          </div>
        </div>
      </article>

      <article className="summary-card">
        <div className="card-meta">
          <span className="card-icon signed">S</span>
          <div>
            <p>Signed Policies</p>
            <strong>{summary.signed}</strong>
          </div>
        </div>
      </article>

      <article className="summary-card">
        <div className="card-meta">
          <span className="card-icon overdue">O</span>
          <div>
            <p>Overdue Policies</p>
            <strong>{summary.overdue}</strong>
          </div>
        </div>
      </article>
    </section>
  );
};

export default SummaryCards;
