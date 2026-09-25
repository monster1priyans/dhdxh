import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { ScreenHeader } from '../../components/ScreenHeader';

export function CircleScreen() {
  const { t } = useTranslation();
  return (
    <>
      <ScreenHeader title={t('tabs.circle')} />
      <EmptyState icon={Users} title={t('circle.empty')} />
    </>
  );
}
