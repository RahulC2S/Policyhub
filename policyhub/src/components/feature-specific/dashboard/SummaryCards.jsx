import React from 'react';

const summaryCards = [
  {
    id: 'pending',
    title: 'Pending Policies',
    icon: 'P',
    iconClass: 'pending',
    valueKey: 'pending',
  },
  {
    id: 'signed',
    title: 'Signed Policies',
    icon: 'S',
    iconClass: 'signed',
    valueKey: 'signed',
  },
  {
    id: 'overdue',
    title: 'Overdue Policies',
    icon: 'O',
    iconClass: 'overdue',
    valueKey: 'overdue',
  },
];

const SummaryCards = ({ summary, onCardClick }) => {
  return (
    <section className="summary-cards">
      {summaryCards.map((card) => (
        <button
          key={card.id}
          type="button"
          className="summary-card summary-card-button"
          onClick={() => onCardClick?.(card.id)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onCardClick?.(card.id);
            }
          }}
        >
          <div className="card-meta">
            <span className={`card-icon ${card.iconClass}`}>{card.icon}</span>
            <div>
              <p>{card.title}</p>
              <strong>{summary[card.valueKey]}</strong>
            </div>
          </div>
        </button>
      ))}
    </section>
  );
};

export default SummaryCards;
