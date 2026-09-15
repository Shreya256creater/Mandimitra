import { useI18n } from '../context/I18nContext.jsx';

const TONE = {
  SELL_NOW: {
    className: 'bg-rose-50 border-rose-200 text-rose-950 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-100',
    pill: 'bg-rose-600 text-white',
  },
  WAIT_FEW_DAYS: {
    className: 'bg-amber-50 border-amber-200 text-amber-950 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-100',
    pill: 'bg-amber-600 text-white',
  },
  SELL_PART_STORE_REST: {
    className: 'bg-sky-50 border-sky-200 text-sky-950 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-100',
    pill: 'bg-sky-700 text-white',
  },
};

export default function SellTimingBanner({ advice, reasoning }) {
  const { t } = useI18n();
  const meta = TONE[advice] || TONE.SELL_NOW;

  return (
    <div className={`rounded-2xl border p-5 ${meta.className}`}>
      <div className="flex flex-wrap items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${meta.pill}`}>
          {advice}
        </span>
        <h2 className="text-lg font-semibold">{t(`timing.${advice}`) || t('timing.SELL_NOW')}</h2>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-6">{reasoning}</p>
    </div>
  );
}
