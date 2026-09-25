import type { Paint } from '../lib/cycle';

interface Props {
  day: number;
  paint: Paint;
  isToday: boolean;
  hasLog: boolean;
  label: string;
  onClick: () => void;
}

/** One calendar day. Colour is never the only signal: the legend and the day sheet say it in words too. */
export function DayCell({ day, paint, isToday, hasLog, label, onClick }: Props) {
  const fill = paint.logged
    ? 'bg-period text-white'
    : paint.predicted
      ? 'bg-period-tint border-2 border-dashed border-period'
      : paint.fertile
        ? 'bg-fertile-tint'
        : '';
  return (
    <button
      type="button" onClick={onClick} aria-label={label}
      className={`relative grid aspect-square min-h-11 w-full place-items-center rounded-full text-[0.9375rem] transition-transform duration-150 active:scale-95 ${fill} ${
        isToday ? 'outline-2 outline-offset-1 outline-ink' : ''
      }`}
    >
      {paint.ovulation && <span aria-hidden className="absolute inset-0.5 rounded-full border-2 border-fertile" />}
      <span className={isToday ? 'font-semibold' : ''}>{day}</span>
      {paint.ovulation && <span aria-hidden className="absolute top-1 right-1 size-1.5 rounded-full bg-fertile" />}
      {hasLog && <span aria-hidden className={`absolute bottom-1 size-1.5 rounded-full ${paint.logged ? 'bg-white' : 'bg-ink'}`} />}
    </button>
  );
}
