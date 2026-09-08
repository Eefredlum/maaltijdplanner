// Date helpers for the weekly planner.

export const DAY_NAMES_NL = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];

export function toISODate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

// Monday of the week containing `date`.
export function getMondayOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = sunday
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function addDays(date, amount) {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

export function daysBetween(dateA, dateB) {
  const a = new Date(toISODate(dateA));
  const b = new Date(toISODate(dateB));
  return Math.abs(Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24)));
}

export function formatDayLabel(date) {
  return new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short' }).format(date);
}

export function buildWeekDays(weekStart) {
  return DAY_NAMES_NL.map((name, index) => {
    const date = addDays(weekStart, index);
    return { dayName: name, date, isoDate: toISODate(date) };
  });
}
