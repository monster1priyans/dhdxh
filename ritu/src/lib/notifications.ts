import { LocalNotifications, type LocalNotificationSchema } from '@capacitor/local-notifications';
import { localToday } from '../../shared/engine';
import i18n from '../i18n';
import { listProfiles } from '../data/profiles';
import { listReminders } from '../data/reminders';
import { useLock } from '../store/lock';
import { isNative } from './platform';
import { planProfile, type PlannedNotification } from './schedule';

/** Reminders need the Android app; the web version has no way to fire them offline. */
export const remindersSupported = (): boolean => isNative();

export async function notificationsAllowed(): Promise<boolean> {
  if (!isNative()) return false;
  return (await LocalNotifications.checkPermissions()).display === 'granted';
}

/** Ask for POST_NOTIFICATIONS (Android 13+). Call only after explaining why. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNative()) return false;
  const granted = (await LocalNotifications.requestPermissions()).display === 'granted';
  if (granted) await rescheduleAll();
  return granted;
}

function text(n: PlannedNotification, name: string, discreet: boolean): { title: string; body: string } {
  const t = i18n.t.bind(i18n);
  if (discreet) return { title: t('notify.discreetTitle'), body: t('notify.discreetBody') };
  const body = n.text.kind === 'period_soon' ? t('notify.periodSoon', { count: n.text.days })
    : n.text.kind === 'period_late' ? t('notify.periodLate', { count: n.text.days })
      : n.text.kind === 'fertile_soon' ? t('notify.fertileSoon')
        : n.text.kind === 'pill' ? t('notify.pill') : t('notify.dailyLog');
  return { title: name, body };
}

const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

let running: Promise<void> = Promise.resolve();

/** Cancels every pending notification and schedules the next 3 cycles for every profile. */
export function rescheduleAll(): Promise<void> {
  running = running.then(doReschedule, doReschedule);
  return running;
}

async function doReschedule(): Promise<void> {
  if (!isNative()) return;
  if ((await LocalNotifications.checkPermissions()).display !== 'granted') return;
  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length) {
    await LocalNotifications.cancel({ notifications: pending.notifications.map(n => ({ id: n.id })) });
  }
  const now = new Date();
  const today = localToday(now);
  const pinned = useLock.getState().pinned;
  const out: LocalNotificationSchema[] = [];
  for (const p of await listProfiles()) {
    // a PIN-protected profile never shows her name or cycle on the lock screen
    const discreet = p.discreet || Boolean(pinned[p.id]);
    for (const n of planProfile(p, await listReminders(p.id), today, hhmm(now))) {
      const { title, body } = text(n, p.name, discreet);
      let at: Date | undefined;
      if (n.date) {
        const [y, m, d] = n.date.split('-').map(Number);
        at = new Date(y, m - 1, d, n.hour, n.minute);
      }
      out.push({
        id: n.id, title, body, extra: { pid: p.id }, smallIcon: 'ic_stat_ritu', iconColor: '#3B3486',
        schedule: at ? { at, allowWhileIdle: true } : { on: { hour: n.hour, minute: n.minute }, allowWhileIdle: true },
      });
    }
  }
  if (out.length) await LocalNotifications.schedule({ notifications: out });
}

/** Tapping a notification opens that profile (the PIN screen shows first if she is locked). */
export function listenForTaps(open: (pid: string) => void): void {
  if (!isNative()) return;
  void LocalNotifications.addListener('localNotificationActionPerformed', e => {
    const pid = (e.notification.extra as { pid?: string } | undefined)?.pid;
    if (pid) open(pid);
  });
}
