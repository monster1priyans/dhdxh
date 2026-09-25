import type { ISODate } from '../../shared/engine';
import { intlLocale } from '../i18n';

// Cycle dates are calendar dates, so format them at UTC noon: no timezone can shift the day.
const asDate = (d: ISODate) => new Date(`${d}T12:00:00Z`);

export function formatDate(d: ISODate, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }): string {
  return new Intl.DateTimeFormat(intlLocale(), { ...opts, timeZone: 'UTC' }).format(asDate(d));
}

export const formatLongDate = (d: ISODate): string =>
  formatDate(d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
