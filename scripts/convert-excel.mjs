// Converts the source Excel file into src/data/recipes.json.
// Run with: node scripts/convert-excel.mjs
// Re-run this whenever "Import/Wat eten we vandaag.xlsx" is updated.
// Note: only run this locally via Node, never import 'xlsx' into the app itself (unpatched security advisories).
import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';

const sourcePath = path.resolve('Import/Wat eten we vandaag.xlsx');
const targetPath = path.resolve('src/data/recipes.json');

const workbook = xlsx.readFile(sourcePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

const recipes = rows
  .map((row, index) => {
    const ingredients = String(row['Ingredienten'] || '')
      .split(',')
      .map(i => i.trim())
      .filter(Boolean);
    const name = String(row['Naam gerecht'] || '').trim();
    return {
      id: index + 1,
      name,
      ingredients,
      season: String(row['categorie'] || '').trim() || 'hele jaar',
      sportMeal: String(row['sportmaaltijd'] || '').trim().toLowerCase() === 'x',
      special: String(row['speciaal'] || '').trim().toLowerCase() === 'x',
      // No ingredients listed means it's a takeaway order (e.g. "Sushi afhalen").
      takeaway: ingredients.length === 0,
    };
  })
  .filter(r => r.name.length > 0);

fs.writeFileSync(targetPath, JSON.stringify(recipes, null, 2) + '\n', 'utf-8');
console.log(`Wrote ${recipes.length} recipes to ${targetPath}`);
