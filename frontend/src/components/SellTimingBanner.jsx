const COPY = {
  SELL_NOW: {
    title: 'Sell now',
    className: 'bg-rose-50 border-rose-200 text-rose-950',
    pill: 'bg-rose-600 text-white',
  },
  WAIT_FEW_DAYS: {
    title: 'Wait a few days',
    className: 'bg-amber-50 border-amber-200 text-amber-950',
    pill: 'bg-amber-600 text-white',
  },
  SELL_PART_STORE_REST: {
    title: 'Sell part, store the rest',
    className: 'bg-sky-50 border-sky-200 text-sky-950',
    pill: 'bg-sky-700 text-white',
  },
};

export default function SellTimingBanner({ advice, reasoning }) {
  const meta = COPY[advice] || COPY.SELL_NOW;

  return (
    <div className={`rounded-2xl border p-5 ${meta.className}`}>
      <div className="flex flex-wrap items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${meta.pill}`}>
          {advice}
        </span>
        <h2 className="text-lg font-semibold">{meta.title}</h2>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-6">{reasoning}</p>
    </div>
  );
}
