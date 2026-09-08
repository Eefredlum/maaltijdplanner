import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { buildWeekDays, getMondayOfWeek, addDays, toISODate, formatDayLabel } from '../utils/dates';
import { generateWeekPlan, rerollDay } from '../utils/planner';
import {
  getRecipes,
  getHistory,
  addHistoryEntries,
  saveWeek,
  getCurrentPlan,
  saveCurrentPlan,
} from '../utils/storage';
import PlannerView from './PlannerView';
import ShoppingListView from './ShoppingListView';
import HistoryView from './HistoryView';
import RecipeManager from './RecipeManager';
import '../styles/MealPlanner.css';

function buildEmptyPlan(weekStart) {
  return buildWeekDays(weekStart).map(day => ({
    ...day,
    isSportDay: false,
    recipeId: null,
    relaxed: [],
  }));
}

const MealPlanner = () => {
  const [activeTab, setActiveTab] = useState('planner');
  const [recipes, setRecipes] = useState(() => getRecipes());
  const [history, setHistory] = useState(() => getHistory());

  const [weekStart, setWeekStart] = useState(() => {
    const stored = getCurrentPlan();
    return stored ? new Date(stored.weekStartISO) : getMondayOfWeek(new Date());
  });
  const [days, setDays] = useState(() => {
    const stored = getCurrentPlan();
    if (stored) {
      return stored.days.map(d => ({ ...d, date: new Date(d.isoDate) }));
    }
    return buildEmptyPlan(getMondayOfWeek(new Date()));
  });
  const [shoppingChecked, setShoppingChecked] = useState(() => getCurrentPlan()?.shopping?.checked || {});
  const [customItems, setCustomItems] = useState(() => getCurrentPlan()?.shopping?.custom || []);
  const [saveMessage, setSaveMessage] = useState('');

  const persistPlan = useCallback((nextDays, nextWeekStart, nextChecked, nextCustom) => {
    saveCurrentPlan({
      weekStartISO: toISODate(nextWeekStart),
      days: nextDays.map(({ dayName, isoDate, isSportDay, recipeId, relaxed }) => ({
        dayName,
        isoDate,
        isSportDay,
        recipeId,
        relaxed,
      })),
      shopping: { checked: nextChecked, custom: nextCustom },
    });
  }, []);

  useEffect(() => {
    persistPlan(days, weekStart, shoppingChecked, customItems);
  }, [days, weekStart, shoppingChecked, customItems, persistPlan]);

  const recipeById = useMemo(() => new Map(recipes.map(r => [r.id, r])), [recipes]);

  const weekDaysWithRecipes = useMemo(
    () => days.map(day => ({ ...day, recipe: day.recipeId != null ? recipeById.get(day.recipeId) || null : null })),
    [days, recipeById]
  );

  const refreshRecipes = () => setRecipes(getRecipes());

  const handleToggleSportDay = isoDate => {
    setDays(prev => {
      const updated = prev.map(d => (d.isoDate === isoDate ? { ...d, isSportDay: !d.isSportDay } : d));
      const target = updated.find(d => d.isoDate === isoDate);
      // Reroll this day if its current meal no longer matches the sport requirement.
      if (target.recipeId != null) {
        const recipe = recipeById.get(target.recipeId);
        if (target.isSportDay && recipe && !recipe.sportMeal) {
          const otherWeekRecipes = updated
            .filter(d => d.isoDate !== isoDate && d.recipeId != null)
            .map(d => recipeById.get(d.recipeId))
            .filter(Boolean);
          const { recipe: newRecipe, relaxed } = rerollDay({
            day: { ...target, date: new Date(target.isoDate), recipe },
            sportDayMap: Object.fromEntries(updated.map(d => [d.isoDate, d.isSportDay])),
            recipes,
            history,
            otherWeekRecipes,
          });
          return updated.map(d =>
            d.isoDate === isoDate ? { ...d, recipeId: newRecipe ? newRecipe.id : null, relaxed } : d
          );
        }
      }
      return updated;
    });
  };

  const handleGenerateWeek = () => {
    const sportDayMap = Object.fromEntries(days.map(d => [d.isoDate, d.isSportDay]));
    const plan = generateWeekPlan({
      weekDays: days.map(d => ({ ...d, date: new Date(d.isoDate) })),
      sportDayMap,
      recipes,
      history,
    });
    setDays(plan.map(d => ({ ...d, recipeId: d.recipe ? d.recipe.id : null })));
    setSaveMessage('');
  };

  const handleRerollDay = isoDate => {
    setDays(prev => {
      const target = prev.find(d => d.isoDate === isoDate);
      const otherWeekRecipes = prev
        .filter(d => d.isoDate !== isoDate && d.recipeId != null)
        .map(d => recipeById.get(d.recipeId))
        .filter(Boolean);
      const sportDayMap = Object.fromEntries(prev.map(d => [d.isoDate, d.isSportDay]));
      const recipe = target.recipeId != null ? recipeById.get(target.recipeId) : null;
      const { recipe: newRecipe, relaxed } = rerollDay({
        day: { ...target, date: new Date(target.isoDate), recipe },
        sportDayMap,
        recipes,
        history,
        otherWeekRecipes,
      });
      return prev.map(d =>
        d.isoDate === isoDate ? { ...d, recipeId: newRecipe ? newRecipe.id : null, relaxed } : d
      );
    });
    setSaveMessage('');
  };

  const handleClearDay = isoDate => {
    setDays(prev => prev.map(d => (d.isoDate === isoDate ? { ...d, recipeId: null, relaxed: [] } : d)));
  };

  const handleSaveWeek = () => {
    const plannedDays = weekDaysWithRecipes.filter(d => d.recipe);
    if (plannedDays.length === 0) {
      setSaveMessage('Er is nog geen enkel gerecht ingepland.');
      return;
    }
    const entries = plannedDays.map(d => ({ recipeId: d.recipe.id, date: d.isoDate }));
    const updatedHistory = addHistoryEntries(entries);
    setHistory(updatedHistory);
    saveWeek({
      weekStart: toISODate(weekStart),
      days: plannedDays.map(d => ({
        dayName: d.dayName,
        isoDate: d.isoDate,
        isSportDay: d.isSportDay,
        recipeName: d.recipe.name,
        recipeId: d.recipe.id,
      })),
    });
    setSaveMessage('Weekmenu opgeslagen! ✅');
  };

  const handleChangeWeek = offsetDays => {
    const nextWeekStart = addDays(weekStart, offsetDays);
    setWeekStart(nextWeekStart);
    setDays(buildEmptyPlan(nextWeekStart));
    setSaveMessage('');
  };

  return (
    <div className="meal-planner">
      <header className="planner-header">
        <h1>🍽️ Wat eten we vandaag?</h1>
        <div className="tab-buttons">
          <button className={`tab-btn ${activeTab === 'planner' ? 'active' : ''}`} onClick={() => setActiveTab('planner')}>
            Planner
          </button>
          <button className={`tab-btn ${activeTab === 'shopping' ? 'active' : ''}`} onClick={() => setActiveTab('shopping')}>
            Boodschappen
          </button>
          <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            Geschiedenis
          </button>
          <button className={`tab-btn ${activeTab === 'recipes' ? 'active' : ''}`} onClick={() => setActiveTab('recipes')}>
            Gerechten
          </button>
        </div>
      </header>

      {activeTab === 'planner' && (
        <PlannerView
          weekStart={weekStart}
          weekDays={weekDaysWithRecipes}
          saveMessage={saveMessage}
          onPrevWeek={() => handleChangeWeek(-7)}
          onNextWeek={() => handleChangeWeek(7)}
          onToggleSportDay={handleToggleSportDay}
          onGenerateWeek={handleGenerateWeek}
          onRerollDay={handleRerollDay}
          onClearDay={handleClearDay}
          onSaveWeek={handleSaveWeek}
          formatDayLabel={formatDayLabel}
        />
      )}

      {activeTab === 'shopping' && (
        <ShoppingListView
          weekDays={weekDaysWithRecipes}
          checked={shoppingChecked}
          onToggleChecked={item => setShoppingChecked(prev => ({ ...prev, [item]: !prev[item] }))}
          customItems={customItems}
          onAddCustomItem={item => setCustomItems(prev => [...prev, item])}
          onRemoveCustomItem={item => setCustomItems(prev => prev.filter(i => i !== item))}
        />
      )}

      {activeTab === 'history' && <HistoryView />}

      {activeTab === 'recipes' && <RecipeManager recipes={recipes} onChange={refreshRecipes} />}
    </div>
  );
};

export default MealPlanner;
