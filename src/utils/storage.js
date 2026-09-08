import baseRecipes from '../data/recipes.json';

const KEYS = {
  RECIPES: 'mealplanner.recipes',
  HISTORY: 'mealplanner.history', // [{ recipeId, date }]
  WEEKS: 'mealplanner.weeks', // saved (confirmed) week plans
  CURRENT_PLAN: 'mealplanner.currentPlan', // in-progress, not yet saved week
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Backfills fields introduced after recipes were first seeded into localStorage.
function migrateRecipe(recipe) {
  if (recipe.takeaway !== undefined) return recipe;
  return { ...recipe, takeaway: recipe.ingredients.length === 0 };
}

export function getRecipes() {
  const stored = readJSON(KEYS.RECIPES, null);
  if (!stored) {
    writeJSON(KEYS.RECIPES, baseRecipes);
    return baseRecipes;
  }
  const migrated = stored.map(migrateRecipe);
  if (JSON.stringify(migrated) !== JSON.stringify(stored)) writeJSON(KEYS.RECIPES, migrated);
  return migrated;
}

export function saveRecipes(recipes) {
  writeJSON(KEYS.RECIPES, recipes);
}

export function addRecipe(recipe) {
  const recipes = getRecipes();
  const nextId = recipes.length ? Math.max(...recipes.map(r => Number(r.id) || 0)) + 1 : 1;
  const newRecipe = { ...recipe, id: nextId };
  const updated = [...recipes, newRecipe];
  saveRecipes(updated);
  return updated;
}

export function updateRecipe(recipeId, changes) {
  const updated = getRecipes().map(r => (r.id === recipeId ? { ...r, ...changes } : r));
  saveRecipes(updated);
  return updated;
}

export function deleteRecipe(recipeId) {
  const updated = getRecipes().filter(r => r.id !== recipeId);
  saveRecipes(updated);
  return updated;
}

export function getHistory() {
  return readJSON(KEYS.HISTORY, []);
}

export function addHistoryEntries(entries) {
  const history = getHistory();
  const updated = [...history, ...entries];
  writeJSON(KEYS.HISTORY, updated);
  return updated;
}

export function getSavedWeeks() {
  return readJSON(KEYS.WEEKS, []);
}

export function saveWeek(week) {
  const weeks = getSavedWeeks();
  const updated = [week, ...weeks];
  writeJSON(KEYS.WEEKS, updated);
  return updated;
}

export function deleteSavedWeek(weekStart) {
  const updated = getSavedWeeks().filter(w => w.weekStart !== weekStart);
  writeJSON(KEYS.WEEKS, updated);
  return updated;
}

export function getCurrentPlan() {
  return readJSON(KEYS.CURRENT_PLAN, null);
}

export function saveCurrentPlan(plan) {
  writeJSON(KEYS.CURRENT_PLAN, plan);
}
