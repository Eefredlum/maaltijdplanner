import React, { useState } from 'react';
import { addRecipe, updateRecipe, deleteRecipe } from '../utils/storage';

const SEASON_OPTIONS = ['hele jaar', 'zomer', 'winter', 'najaar/winter'];

const emptyForm = { name: '', ingredients: '', season: 'hele jaar', sportMeal: false, special: false };

function recipeToFormValues(recipe) {
  return {
    name: recipe.name,
    ingredients: recipe.ingredients.join(', '),
    season: recipe.season,
    sportMeal: recipe.sportMeal,
    special: recipe.special,
  };
}

function formValuesToRecipe(values) {
  const ingredients = values.ingredients.split(',').map(i => i.trim()).filter(Boolean);
  return {
    name: values.name.trim(),
    ingredients,
    season: values.season,
    sportMeal: values.sportMeal,
    special: values.special,
    // Geen ingrediënten betekent een afhaalmaaltijd (bv. "Sushi afhalen"); mag alleen op do/vr/za.
    takeaway: ingredients.length === 0,
  };
}

const RecipeForm = ({ values, onChange, onSubmit, onCancel, submitLabel }) => (
  <div className="recipe-form">
    <input
      type="text"
      placeholder="Naam gerecht"
      value={values.name}
      onChange={e => onChange({ ...values, name: e.target.value })}
    />
    <input
      type="text"
      placeholder="Ingrediënten (gescheiden door komma's)"
      value={values.ingredients}
      onChange={e => onChange({ ...values, ingredients: e.target.value })}
    />
    <select value={values.season} onChange={e => onChange({ ...values, season: e.target.value })}>
      {SEASON_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
    </select>
    <label>
      <input
        type="checkbox"
        checked={values.sportMeal}
        onChange={e => onChange({ ...values, sportMeal: e.target.checked })}
      /> 🏋️ Sportmaaltijd
    </label>
    <label>
      <input
        type="checkbox"
        checked={values.special}
        onChange={e => onChange({ ...values, special: e.target.checked })}
      /> ⭐ Speciaal (max 1x/4 weken)
    </label>
    <div className="recipe-form-actions">
      <button onClick={onSubmit}>{submitLabel}</button>
      {onCancel && <button onClick={onCancel}>Annuleren</button>}
    </div>
  </div>
);

const RecipeManager = ({ recipes, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newForm, setNewForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const visibleRecipes = recipes.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAdd = () => {
    if (!newForm.name.trim()) return;
    addRecipe(formValuesToRecipe(newForm));
    setNewForm(emptyForm);
    onChange();
  };

  const startEdit = recipe => {
    setEditingId(recipe.id);
    setEditForm(recipeToFormValues(recipe));
  };

  const handleSaveEdit = () => {
    updateRecipe(editingId, formValuesToRecipe(editForm));
    setEditingId(null);
    onChange();
  };

  const handleDelete = id => {
    deleteRecipe(id);
    onChange();
  };

  return (
    <div className="recipes-section">
      <h2>📖 Gerechten beheren</h2>

      <div className="recipe-form-card">
        <h3>Nieuw gerecht toevoegen</h3>
        <RecipeForm values={newForm} onChange={setNewForm} onSubmit={handleAdd} submitLabel="➕ Toevoegen" />
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Zoek gerecht..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="recipes-grid">
        {visibleRecipes.map(recipe => (
          <div key={recipe.id} className="recipe-card">
            {editingId === recipe.id ? (
              <RecipeForm
                values={editForm}
                onChange={setEditForm}
                onSubmit={handleSaveEdit}
                onCancel={() => setEditingId(null)}
                submitLabel="💾 Opslaan"
              />
            ) : (
              <>
                <h4>{recipe.name}</h4>
                <p><strong>Ingrediënten:</strong> {recipe.ingredients.join(', ') || '—'}</p>
                <div className="recipe-tags">
                  {recipe.sportMeal && <span className="tag tag-sport">🏋️ sport</span>}
                  {recipe.special && <span className="tag tag-special">⭐ speciaal</span>}
                  {recipe.takeaway && <span className="tag tag-takeaway">🥡 afhaal (do/vr/za)</span>}
                  <span className="tag tag-season">{recipe.season}</span>
                </div>
                <div className="recipe-card-actions">
                  <button onClick={() => startEdit(recipe)}>✏️ Bewerken</button>
                  <button className="delete-btn" onClick={() => handleDelete(recipe.id)}>✕ Verwijderen</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeManager;
