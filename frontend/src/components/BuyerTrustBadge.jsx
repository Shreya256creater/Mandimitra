import { useI18n } from '../context/I18nContext.jsx';

export default function BuyerTrustBadge({ score }) {
  const { t } = useI18n();
  const value = Number(score) || 0;
  let tone = 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100';
  let label = t('trust.moderate');
  if (value >= 80) {
    tone = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100';
    label = t('trust.high');
  } else if (value < 55) {
    tone = 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-100';
    label = t('trust.delay');
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {t('trust.label')} {value.toFixed(0)}
      <span className="font-normal opacity-80">· {label}</span>
    </span>
  );
}
