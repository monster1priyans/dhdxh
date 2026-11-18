import type { ISODate } from '../../shared/engine';
import { intlLocale } from '../i18n';

// Cycle dates are calendar dates, so format them at UTC noon: no timezone can shift the day.
const asDate = (d: ISODate) => new Date(`${d}T12:00:00Z`);

export function formatDate(d: ISODate, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }): string {
  return new Intl.DateTimeFormat(intlLocale(), { ...opts, timeZone: 'UTC' }).format(asDate(d));
}

export const formatLongDate = (d: ISODate): string =>
  formatDate(d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export const formatDateTime = (ms: number): string =>
  new Intl.DateTimeFormat(intlLocale(), { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(ms);

export const formatMonth = (year: number, month0: number): string =>
  new Intl.DateTimeFormat(intlLocale(), { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, month0, 15)));

export const formatNumber = (n: number): string => new Intl.NumberFormat(intlLocale(), { maximumFractionDigits: 1 }).format(n);
