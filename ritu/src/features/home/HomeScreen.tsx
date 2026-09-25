import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';
import { localToday } from '../../../shared/engine';
import { EmptyState } from '../../components/EmptyState';
import { ScreenHeader } from '../../components/ScreenHeader';
import { formatLongDate } from '../../lib/format';

export function HomeScreen() {
  const { t } = useTranslation();
  return (
    <>
      <ScreenHeader title={t('app.name')} sub={formatLongDate(localToday())} />
      <EmptyState icon={UserPlus} title={t('home.empty')}>{t('home.emptyHint')}</EmptyState>
    </>
  );
}
