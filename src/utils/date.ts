import { LanguageConfig } from '../languages/types';

export function formatDateFromIso(iso: string, language: LanguageConfig): string {
  try {
    const [year, month, day] = iso.split('-').map(value => parseInt(value, 10));
    if (!year || !month || !day) return iso;

    const monthName = language.months[month - 1] || '';
    const weekday = new Date(year, month - 1, day).getDay();
    const weekdayName = language.weekdays[weekday] || '';
    return `${day} ${monthName}, ${year} (${weekdayName})`;
  } catch {
    return iso;
  }
}
