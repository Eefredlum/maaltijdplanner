import { getCurrentSeason, isSeasonEligible } from './seasons';
import { daysBetween } from './dates';

const NORMAL_NO_REPEAT_DAYS = 14; // geen herhaling binnen 2 weken
const SPECIAL_NO_REPEAT_DAYS = 28; // speciale gerechten max 1x per 4 weken
const ALLOWED_TAKEAWAY_WEEKDAYS = [4, 5, 6]; // Date.getDay(): donderdag, vrijdag, zaterdag

function wasRecentlyUsed(recipe, date, history) {
  const threshold = recipe.special ? SPECIAL_NO_REPEAT_DAYS : NORMAL_NO_REPEAT_DAYS;
  return history.some(
    entry => entry.recipeId === recipe.id && daysBetween(entry.date, date) < threshold
  );
}

function filterRecipes(recipes, { date, isSportDay, history, excludeIds, specialUsedThisWeek, ignoreSeason, ignoreHistory, ignoreSport }) {
  const currentSeason = getCurrentSeason(new Date(date));
  const weekday = new Date(date).getDay();
  return recipes.filter(recipe => {
    if (excludeIds.has(recipe.id)) return false;
    // Hard rules, never relaxed: afhaalmaaltijden alleen op donderdag/vrijdag/zaterdag, max 1 speciaal per week.
    if (recipe.takeaway && !ALLOWED_TAKEAWAY_WEEKDAYS.includes(weekday)) return false;
    if (recipe.special && specialUsedThisWeek) return false;
    if (!ignoreSeason && !isSeasonEligible(recipe.season, currentSeason)) return false;
    if (!ignoreHistory && wasRecentlyUsed(recipe, date, history)) return false;
    if (!ignoreSport && isSportDay && !recipe.sportMeal) return false;
    return true;
  });
}

function pickRandom(list) {
  if (list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}

// Tries progressively relaxed constraint sets so a suggestion is (almost) always found.
export function pickMealForDay({ date, isSportDay, recipes, history, excludeIds, specialUsedThisWeek = false }) {
  const attempts = isSportDay
    ? [
        { ignoreSeason: false, ignoreHistory: false, ignoreSport: false },
        { ignoreSeason: false, ignoreHistory: true, ignoreSport: false },
        { ignoreSeason: true, ignoreHistory: false, ignoreSport: false },
        { ignoreSeason: true, ignoreHistory: true, ignoreSport: false },
        { ignoreSeason: false, ignoreHistory: false, ignoreSport: true },
        { ignoreSeason: false, ignoreHistory: true, ignoreSport: true },
        { ignoreSeason: true, ignoreHistory: false, ignoreSport: true },
        { ignoreSeason: true, ignoreHistory: true, ignoreSport: true },
      ]
    : [
        { ignoreSeason: false, ignoreHistory: false, ignoreSport: true },
        { ignoreSeason: false, ignoreHistory: true, ignoreSport: true },
        { ignoreSeason: true, ignoreHistory: false, ignoreSport: true },
        { ignoreSeason: true, ignoreHistory: true, ignoreSport: true },
      ];

  for (const attempt of attempts) {
    const candidates = filterRecipes(recipes, { date, isSportDay, history, excludeIds, specialUsedThisWeek, ...attempt });
    const recipe = pickRandom(candidates);
    if (recipe) {
      const relaxed = [];
      if (attempt.ignoreSeason) relaxed.push('seizoen genegeerd');
      if (attempt.ignoreHistory) relaxed.push('herhalingsregel genegeerd');
      if (isSportDay && attempt.ignoreSport) relaxed.push('sportmaaltijd-eis genegeerd');
      return { recipe, relaxed };
    }
  }
  return { recipe: null, relaxed: [] };
}

export function generateWeekPlan({ weekDays, sportDayMap, recipes, history }) {
  const excludeIds = new Set();
  let specialUsedThisWeek = false;
  return weekDays.map(day => {
    const isSportDay = !!sportDayMap[day.isoDate];
    const { recipe, relaxed } = pickMealForDay({
      date: day.date,
      isSportDay,
      recipes,
      history,
      excludeIds,
      specialUsedThisWeek,
    });
    if (recipe) {
      excludeIds.add(recipe.id);
      if (recipe.special) specialUsedThisWeek = true;
    }
    return { ...day, isSportDay, recipe, relaxed };
  });
}

// `otherWeekRecipes`: recipes already placed on the other days of this same week.
export function rerollDay({ day, sportDayMap, recipes, history, otherWeekRecipes }) {
  const isSportDay = !!sportDayMap[day.isoDate];
  const excludeIds = new Set(otherWeekRecipes.map(r => r.id));
  if (day.recipe) excludeIds.add(day.recipe.id);
  const specialUsedThisWeek = otherWeekRecipes.some(r => r.special);
  return pickMealForDay({ date: day.date, isSportDay, recipes, history, excludeIds, specialUsedThisWeek });
}
