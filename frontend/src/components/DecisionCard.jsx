import BuyerTrustBadge from './BuyerTrustBadge.jsx';
import { useI18n } from '../context/I18nContext.jsx';

function inr(n) {
  return `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function DecisionCard({ option, rank }) {
  const { t } = useI18n();

  return (
    <article className="mm-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-crop-600 dark:text-crop-300">
            {t('table.rank')} #{rank}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-crop-900 dark:text-crop-100">{option.buyerOrMarketName}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {option.optionType === 'MARKET' ? t('table.marketPrice') : t('table.buyerOffer')}
            {option.district ? ` · ${option.district}, ${option.state}` : ''}
          </p>
        </div>
        <BuyerTrustBadge score={option.buyerTrustScore} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-slate-500 dark:text-slate-400">{t('table.listedPrice')}</dt>
          <dd className="font-medium">{inr(option.offerPrice)}/q</dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-slate-400">{t('table.transport')}</dt>
          <dd className="font-medium">−{inr(option.transportCost)}</dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-slate-400">{t('table.storage')}</dt>
          <dd className="font-medium">−{inr(option.storageCost)}</dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-slate-400">{t('table.net')}</dt>
          <dd className="text-base font-bold text-crop-700 dark:text-crop-300">{inr(option.netRealisation)}/q</dd>
        </div>
      </dl>

      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{option.notes}</p>
      {option.qualityMatch < 100 && (
        <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300">
          {t('table.qualityWarn', { pct: option.qualityMatch })}
        </p>
      )}
    </article>
  );
}
