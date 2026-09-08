import React from 'react';

const PlannerView = ({
  weekStart,
  weekDays,
  saveMessage,
  onPrevWeek,
  onNextWeek,
  onToggleSportDay,
  onGenerateWeek,
  onRerollDay,
  onClearDay,
  onSaveWeek,
  formatDayLabel,
}) => {
  return (
    <div className="planner-section">
      <div className="week-nav">
        <button onClick={onPrevWeek}>← Vorige week</button>
        <h3>Week van {formatDayLabel(weekStart)}</h3>
        <button onClick={onNextWeek}>Volgende week →</button>
      </div>

      <div className="planner-actions">
        <button className="auto-fill-btn" onClick={onGenerateWeek}>✨ Genereer weekmenu</button>
        <button className="save-btn" onClick={onSaveWeek}>💾 Week opslaan</button>
      </div>
      {saveMessage && <p className="save-message">{saveMessage}</p>}

      <div className="week-grid">
        {weekDays.map(day => (
          <div key={day.isoDate} className={`day-card ${day.isSportDay ? 'sport' : ''}`}>
            <div className="day-card-header">
              <h3>{day.dayName}</h3>
              <span className="day-date">{formatDayLabel(day.date)}</span>
            </div>
            <label className="sport-toggle">
              <input
                type="checkbox"
                checked={day.isSportDay}
                onChange={() => onToggleSportDay(day.isoDate)}
              />
              🏋️ Sportdag
            </label>

            {day.recipe ? (
              <div className="selected-meal">
                <p className="meal-name">{day.recipe.name}</p>
                <div className="recipe-tags">
                  {day.recipe.sportMeal && <span className="tag tag-sport">🏋️ sport</span>}
                  {day.recipe.special && <span className="tag tag-special">⭐ speciaal</span>}
                  {day.recipe.takeaway && <span className="tag tag-takeaway">🥡 afhaal</span>}
                  <span className="tag tag-season">{day.recipe.season}</span>
                </div>
                {day.relaxed.length > 0 && (
                  <p className="relaxed-note">⚠️ {day.relaxed.join(', ')}</p>
                )}
                <button className="clear-btn" onClick={() => onClearDay(day.isoDate)}>✕ Wis</button>
              </div>
            ) : (
              <p className="no-meal">Geen gerecht</p>
            )}

            <button className="choose-btn" onClick={() => onRerollDay(day.isoDate)}>
              🔀 Andere suggestie
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlannerView;
