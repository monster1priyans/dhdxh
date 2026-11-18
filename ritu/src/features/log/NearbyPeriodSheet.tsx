import { useTranslation } from 'react-i18next';
import { ConfirmSheet } from '../../components/ConfirmSheet';
import { formatDate } from '../../lib/format';
import type { PeriodLike } from '../../lib/periodRules';

export function NearbyPeriodSheet({ nearby, onEdit, onNew, onClose }: {
  nearby: PeriodLike | null; onEdit: () => void; onNew: () => void; onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <ConfirmSheet
      open={nearby !== null} onClose={onClose} title={t('log.nearbyTitle')}
      body={nearby ? t('log.nearbyBody', { date: formatDate(nearby.startDate) }) : ''}
      actions={[
        { label: t('log.editExisting'), onClick: onEdit, variant: 'primary' },
        { label: t('log.addNew'), onClick: onNew },
      ]}
    />
  );
}
