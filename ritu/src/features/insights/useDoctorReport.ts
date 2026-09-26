import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { healthFlags, localToday } from '../../../shared/engine';
import { ageOf } from '../../data/actions';
import { toEnginePeriods } from '../../data/periods';
import type { Profile } from '../../data/types';
import { useProfileData } from '../../hooks/useProfileData';
import { buildReport, reportPdfBase64 } from '../../lib/report';
import { deliverFiles, safeFileName } from '../../lib/files';
import { toast } from '../../store/toast';

export function useDoctorReport(profile: Profile) {
  const { t } = useTranslation();
  const { periods, logs } = useProfileData(profile.id);
  const [busy, setBusy] = useState(false);
  async function make() {
    setBusy(true);
    try {
      const today = localToday();
      const ps = toEnginePeriods(periods);
      const age = ageOf(profile);
      const flags = healthFlags({ today, periods: ps, logs, pred: profile.prediction, age, mode: profile.mode });
      const base64 = await reportPdfBase64(buildReport({ profile, periods: ps, logs, age, flags, today }));
      await deliverFiles([{ name: `ritu-report-${safeFileName(profile.name)}-${today}.pdf`, mime: 'application/pdf', base64 }], t('insights.report'));
    } catch {
      toast(t('insights.reportFailed'));
    } finally {
      setBusy(false);
    }
  }
  return { make, busy };
}
