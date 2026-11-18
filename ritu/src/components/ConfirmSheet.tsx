import type { ReactNode } from 'react';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';

interface Props {
  open: boolean; title: string; body: ReactNode; onClose: () => void;
  actions: { label: string; onClick: () => void; variant?: 'primary' | 'secondary' | 'danger' }[];
}

export function ConfirmSheet({ open, title, body, onClose, actions }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title}
      footer={<div className="flex flex-col gap-2">{actions.map(a => (
        <Button key={a.label} variant={a.variant ?? 'secondary'} onClick={a.onClick} className="w-full">{a.label}</Button>
      ))}</div>}
    >
      <div className="text-ink-2">{body}</div>
    </BottomSheet>
  );
}
