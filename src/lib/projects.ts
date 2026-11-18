/** Project helpers: completion labels and newest-first ordering. */
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
type P = { data: { completed?: string; completedLabel?: string; date: Date; units?: number; unitsLabel?: string; bathrooms?: string } };
export const completedLabel = (p: P) => p.data.completedLabel ?? (p.data.completed ? `${MONTHS[+p.data.completed.slice(5, 7) - 1]} ${p.data.completed.slice(0, 4)}` : undefined);
export const completedYear = (p: P) => p.data.completed?.slice(0, 4);
export const byCompletion = (a: P, b: P) => (b.data.completed ?? '').localeCompare(a.data.completed ?? '') || b.data.date.valueOf() - a.data.date.valueOf();
export const scaleLabel = (p: P) => [p.data.unitsLabel ?? (p.data.units ? `${p.data.units.toLocaleString()} apartments` : undefined), p.data.bathrooms && `${p.data.bathrooms} bathrooms`].filter(Boolean).join(' · ') || undefined;
