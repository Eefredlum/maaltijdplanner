import React, { useState } from 'react';
import { getSavedWeeks, deleteSavedWeek } from '../utils/storage';

const HistoryView = () => {
  const [weeks, setWeeks] = useState(() => getSavedWeeks());

  const handleDelete = weekStart => {
    setWeeks(deleteSavedWeek(weekStart));
  };

  if (weeks.length === 0) {
    return (
      <div className="history-section">
        <h2>🗂️ Geschiedenis</h2>
        <p className="no-meal">Nog geen weekmenu's opgeslagen.</p>
      </div>
    );
  }

  return (
    <div className="history-section">
      <h2>🗂️ Geschiedenis</h2>
      {weeks.map(week => (
        <div key={week.weekStart} className="history-week">
          <div className="history-week-header">
            <h3>Week van {week.weekStart}</h3>
            <button className="delete-btn" onClick={() => handleDelete(week.weekStart)}>✕ Verwijder</button>
          </div>
          <ul>
            {week.days.map(d => (
              <li key={d.isoDate}>
                <strong>{d.dayName}:</strong> {d.recipeName} {d.isSportDay && '🏋️'}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default HistoryView;
