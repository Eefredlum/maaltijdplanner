// Aggregates unique ingredients from all recipes currently placed in a week plan.
export function buildIngredientList(weekDays) {
  const seen = new Map(); // ingredient -> number of recipes using it

  weekDays.forEach(day => {
    if (!day.recipe) return;
    day.recipe.ingredients.forEach(ingredient => {
      const key = ingredient.toLowerCase();
      seen.set(key, {
        label: ingredient,
        count: (seen.get(key)?.count || 0) + 1,
      });
    });
  });

  return Array.from(seen.values()).sort((a, b) => a.label.localeCompare(b.label, 'nl'));
}
