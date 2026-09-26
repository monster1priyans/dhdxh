import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }

/** Modal bottom sheet on top of <dialog>: focus trap, Esc and the Android back button close it. */
export function BottomSheet({ open, onClose, title, children, footer }: Props) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDialogElement>(null);
  const openRef = useRef(open);
  openRef.current = open;
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      // only report closes she made herself (Esc, back, backdrop), not ones driven by `open`
      onClose={() => { if (openRef.current) onClose(); }}
      onCancel={e => { e.preventDefault(); onClose(); }}
      onClick={e => { if (e.target === ref.current) onClose(); }}
      aria-label={title}
      className="sheet m-0 mx-auto mt-auto flex max-h-[92dvh] w-full max-w-[480px] flex-col rounded-t-3xl bg-surface p-0 text-ink shadow-xl backdrop:bg-black/40 [&:not([open])]:hidden"
    >
      <header className="flex items-center justify-between gap-2 border-b border-line px-4 py-2">
        <h2 className="text-xl">{title}</h2>
        <button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-full text-ink-2" aria-label={t('common.close')}>
          <X aria-hidden className="size-5" />
        </button>
      </header>
      <div className="flex-1 overflow-y-auto px-4 py-4">{open && children}</div>
      {open && footer && <footer className="border-t border-line px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">{footer}</footer>}
    </dialog>
  );
}
