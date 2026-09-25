import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { ScreenHeader } from '../../components/ScreenHeader';

export function ProfilesScreen() {
  const { t } = useTranslation();
  return (
    <>
      <ScreenHeader title={t('tabs.profiles')} />
      <EmptyState icon={Users} title={t('profiles.empty')}>{t('profiles.emptyHint')}</EmptyState>
    </>
  );
}
