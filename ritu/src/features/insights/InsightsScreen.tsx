import { useTranslation } from 'react-i18next';
import { BarChart3 } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { ScreenHeader } from '../../components/ScreenHeader';

export function InsightsScreen() {
  const { t } = useTranslation();
  return (
    <>
      <ScreenHeader title={t('tabs.insights')} />
      <EmptyState icon={BarChart3} title={t('insights.empty')} />
    </>
  );
}
