import { useTranslation } from 'react-i18next';
import { CalendarDays } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { ScreenHeader } from '../../components/ScreenHeader';

export function CalendarScreen() {
  const { t } = useTranslation();
  return (
    <>
      <ScreenHeader title={t('tabs.calendar')} />
      <EmptyState icon={CalendarDays} title={t('calendar.empty')} />
    </>
  );
}
