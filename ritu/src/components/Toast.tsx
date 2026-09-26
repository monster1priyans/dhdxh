import { useToast } from '../store/toast';

export function Toast() {
  const { message, key } = useToast();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-4">
      {message && (
        <div key={key} className="toast max-w-sm rounded-2xl bg-ink px-5 py-2.5 text-center text-[0.9375rem] text-bg shadow-lg">{message}</div>
      )}
    </div>
  );
}
