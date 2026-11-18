export function dayKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  if (y < 1900 || y > 9999) return false;
  const date = new Date(y, m - 1, d, 12);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}
export function localDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}
export function addDays(value: string, count: number): string {
  const date = localDate(value); date.setDate(date.getDate() + count); return dayKey(date);
}
export function addMonths(value: string, count: number): string {
  const date = localDate(value);
  const target = new Date(date.getFullYear(), date.getMonth() + count, 1, 12);
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0, 12).getDate();
  target.setDate(Math.min(date.getDate(), last));
  return dayKey(target);
}
export function formatDate(value: string | null): string {
  return value ? localDate(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'Sem prazo';
}
export function formatLongDate(value: string): string {
  return localDate(value).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}
export function weekStart(value: string): string {
  const date = localDate(value); return addDays(value, -((date.getDay() + 6) % 7));
}
export function weekEnd(value: string): string { return addDays(weekStart(value), 6); }
export function monthStart(value: string): string {
  const d = localDate(value); return dayKey(new Date(d.getFullYear(), d.getMonth(), 1, 12));
}
export function monthEnd(value: string): string {
  const d = localDate(value); return dayKey(new Date(d.getFullYear(), d.getMonth() + 1, 0, 12));
}
export function monthDays(value: string): string[] {
  const start = weekStart(monthStart(value));
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}
export function weekDays(value: string): string[] {
  const start = weekStart(value);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}
export function daysBetween(start: string, end: string): string[] {
  if (!validDate(start) || !validDate(end) || start > end) return [];
  const result: string[] = [];
  for (let cursor = start, guard = 0; cursor <= end && guard < 800; cursor = addDays(cursor, 1), guard++) result.push(cursor);
  return result;
}
export function lastDays(count: number, today = dayKey()): string[] {
  return Array.from({ length: count }, (_, i) => addDays(today, i - count + 1));
}
export function isToday(value: string): boolean { return value === dayKey(); }
export function isPast(value: string): boolean { return value < dayKey(); }
export function monthLabel(value: string): string {
  return localDate(value).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}
export function shortWeekday(value: string): string {
  return localDate(value).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').slice(0, 3);
}
export function relativeDay(value: string, today = dayKey()): string {
  if (value === today) return 'Hoje';
  if (value === addDays(today, 1)) return 'Amanhã';
  if (value === addDays(today, -1)) return 'Ontem';
  return localDate(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}
export function nowTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
export function timeToMinutes(value: string): number | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
}
export function minutesToTime(value: number): string {
  const total = Math.max(0, Math.min(24 * 60 - 1, Math.round(value)));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
