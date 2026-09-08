// Season handling: recipes are tagged with a Dutch season/period, matched against the
// current calendar month so out-of-season suggestions (e.g. stamppot in summer) are avoided.

export const SEASONS = {
  WINTER: 'winter',
  LENTE: 'lente',
  ZOMER: 'zomer',
  HERFST: 'herfst',
};

// Which recipe.season values are allowed for each real-world season.
const ELIGIBLE_RECIPE_SEASONS = {
  [SEASONS.WINTER]: ['hele jaar', 'winter', 'najaar/winter'],
  [SEASONS.LENTE]: ['hele jaar'],
  [SEASONS.ZOMER]: ['hele jaar', 'zomer'],
  [SEASONS.HERFST]: ['hele jaar', 'najaar/winter'],
};

export function getCurrentSeason(date = new Date()) {
  // Astronomical (approximate, fixed) season boundaries.
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();
  const md = month * 100 + day; // e.g. 923 = 23 september

  if (md >= 1221 || md < 320) return SEASONS.WINTER;
  if (md < 621) return SEASONS.LENTE;
  if (md < 923) return SEASONS.ZOMER;
  return SEASONS.HERFST;
}

export function isSeasonEligible(recipeSeason, currentSeason) {
  const allowed = ELIGIBLE_RECIPE_SEASONS[currentSeason] || ['hele jaar'];
  return allowed.includes(recipeSeason);
}
