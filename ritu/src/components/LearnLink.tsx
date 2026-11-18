import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BookOpen, ChevronRight } from 'lucide-react';

/** Entry point to the "How the cycle works" guide. */
export function LearnLink({ className = '' }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <Link to="/learn" className={`flex min-h-14 items-center gap-3 rounded-2xl bg-surface px-4 py-3 ${className}`}>
      <BookOpen aria-hidden className="size-5 shrink-0 text-primary" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-medium">{t('learn.link')}</span>
        <span className="text-sm text-ink-2">{t('learn.linkHint')}</span>
      </span>
      <ChevronRight aria-hidden className="size-5 shrink-0 text-ink-2" />
    </Link>
  );
}
