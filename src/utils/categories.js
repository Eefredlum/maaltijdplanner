// Shared keyword-based classification for the weekly category limits (kip/pasta/rijst).
// Used by the Excel conversion script, the storage migration, and the recipe manager UI.

export const CATEGORY_DEFINITIONS = [
  { key: 'kip', label: '🍗 kip', keywords: ['kip'] },
  { key: 'pasta', label: '🍝 pasta', keywords: ['pasta', 'spaghetti', 'macaroni', 'tagliatelle', 'penne', 'lasagne', 'orzo'] },
  { key: 'rijst', label: '🍚 rijst', keywords: ['rijst', 'risotto'] },
];

// Hard rule, never relaxed: max N times per week per category.
export const CATEGORY_WEEKLY_LIMITS = { kip: 2, pasta: 2, rijst: 2 };

export function detectCategories(name, ingredients) {
  const haystack = `${name} ${ingredients.join(' ')}`.toLowerCase();
  return CATEGORY_DEFINITIONS.filter(({ keywords }) =>
    // Word-boundary match so e.g. "currypasta" doesn't falsely match the "pasta" keyword.
    keywords.some(keyword => new RegExp(`\\b${keyword}`, 'i').test(haystack))
  ).map(({ key }) => key);
}
