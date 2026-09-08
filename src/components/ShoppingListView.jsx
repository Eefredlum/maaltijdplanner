import React, { useState } from 'react';
import { buildIngredientList } from '../utils/shoppingList';

const ShoppingListView = ({ weekDays, checked, onToggleChecked, customItems, onAddCustomItem, onRemoveCustomItem }) => {
  const [newItem, setNewItem] = useState('');
  const ingredients = buildIngredientList(weekDays);

  const handleAdd = () => {
    const value = newItem.trim();
    if (!value) return;
    onAddCustomItem(value);
    setNewItem('');
  };

  const copyList = () => {
    const lines = [
      ...ingredients.map(i => `${checked[i.label] ? '✓' : '○'} ${i.label}`),
      ...customItems.map(i => `${checked[i] ? '✓' : '○'} ${i}`),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
  };

  return (
    <div className="shopping-section">
      <h2>📋 Boodschappenlijst</h2>

      <div className="meals-summary">
        <h3>Deze week:</h3>
        <ul>
          {weekDays.filter(d => d.recipe).map(d => (
            <li key={d.isoDate}><strong>{d.dayName}:</strong> {d.recipe.name}</li>
          ))}
        </ul>
      </div>

      <div className="shopping-controls">
        <input
          type="text"
          placeholder="Voeg zelf een item toe..."
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="custom-item-input"
        />
        <button onClick={handleAdd}>Toevoegen</button>
        <button onClick={copyList} className="export-btn">📋 Kopieer naar klembord</button>
      </div>

      <div className="shopping-items">
        {ingredients.map(item => (
          <div key={item.label} className={`shopping-item ${checked[item.label] ? 'checked' : ''}`}>
            <input type="checkbox" checked={!!checked[item.label]} onChange={() => onToggleChecked(item.label)} />
            <span>{item.label} {item.count > 1 ? `(×${item.count})` : ''}</span>
          </div>
        ))}
        {customItems.map(item => (
          <div key={item} className={`shopping-item ${checked[item] ? 'checked' : ''}`}>
            <input type="checkbox" checked={!!checked[item]} onChange={() => onToggleChecked(item)} />
            <span>{item}</span>
            <button className="delete-btn" onClick={() => onRemoveCustomItem(item)}>✕</button>
          </div>
        ))}
        {ingredients.length === 0 && customItems.length === 0 && (
          <p className="no-meal">Nog geen ingrediënten. Plan eerst een weekmenu in.</p>
        )}
      </div>
    </div>
  );
};

export default ShoppingListView;
