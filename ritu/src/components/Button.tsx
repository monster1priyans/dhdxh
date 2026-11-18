import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const styles: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary',
  secondary: 'border border-line bg-surface text-ink',
  ghost: 'text-primary',
  danger: 'border border-period text-period bg-surface',
};

export function Button({ variant = 'primary', className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 font-medium transition-transform duration-150 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 ${styles[variant]} ${className}`}
    />
  );
}
