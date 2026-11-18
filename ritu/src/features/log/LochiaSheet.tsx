import { useTranslation } from 'react-i18next';
import { ConfirmSheet } from '../../components/ConfirmSheet';

/** Bleeding in the first weeks after a birth is usually lochia; ask before counting it as her first period. */
export function LochiaSheet({ open, onPeriod, onNotPeriod }: { open: boolean; onPeriod: () => void; onNotPeriod: () => void }) {
  const { t } = useTranslation();
  return (
    <ConfirmSheet
      open={open} onClose={onNotPeriod} title={t('lochia.title')} body={t('lochia.body')}
      actions={[
        { label: t('lochia.yes'), variant: 'primary', onClick: onPeriod },
        { label: t('lochia.no'), onClick: onNotPeriod },
      ]}
    />
  );
}
