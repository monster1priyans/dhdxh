import { useToast } from '../store/toast';

export function Toast() {
  const { message, action, key, hide } = useToast();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-4">
      {message && (
        <div key={key} className="toast flex max-w-sm items-center gap-3 rounded-2xl bg-ink px-5 py-2.5 text-center text-[0.9375rem] text-bg shadow-lg">
          <span className="min-w-0 flex-1">{message}</span>
          {action && (
            <button
              type="button"
              className="pointer-events-auto -my-1 shrink-0 rounded-xl px-2 py-1.5 font-semibold underline underline-offset-2"
              onClick={() => { const run = action.run; hide(); void run(); }}
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
