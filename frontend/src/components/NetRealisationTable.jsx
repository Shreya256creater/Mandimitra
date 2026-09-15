import BuyerTrustBadge from './BuyerTrustBadge.jsx';
import { useI18n } from '../context/I18nContext.jsx';

function inr(n) {
  return `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function NetRealisationTable({ options = [] }) {
  const { t } = useI18n();

  return (
    <div className="mm-card overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-crop-100/70 text-crop-900 dark:bg-slate-800 dark:text-crop-100">
          <tr>
            <th className="px-4 py-3 font-semibold">{t('table.rank')}</th>
            <th className="px-4 py-3 font-semibold">{t('table.buyerMarket')}</th>
            <th className="px-4 py-3 font-semibold">{t('table.listedPrice')}</th>
            <th className="px-4 py-3 font-semibold">{t('table.transport')}</th>
            <th className="px-4 py-3 font-semibold">{t('table.storage')}</th>
            <th className="px-4 py-3 font-semibold">{t('table.net')}</th>
            <th className="px-4 py-3 font-semibold">{t('table.trust')}</th>
            <th className="px-4 py-3 font-semibold">{t('table.quality')}</th>
          </tr>
        </thead>
        <tbody>
          {options.map((row, i) => (
            <tr
              key={`${row.optionType}-${row.buyerId || row.marketId}-${i}`}
              className="border-t border-slate-100 dark:border-slate-800"
            >
              <td className="px-4 py-3 font-semibold text-crop-700 dark:text-crop-300">{i + 1}</td>
              <td className="px-4 py-3">
                <div className="font-medium">{row.buyerOrMarketName}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {row.optionType === 'MARKET' ? t('table.mandi') : t('table.buyer')} · {row.distanceKm?.toFixed?.(0) ?? '—'} km
                </div>
              </td>
              <td className="px-4 py-3">{inr(row.offerPrice)}</td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">−{inr(row.transportCost)}</td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">−{inr(row.storageCost)}</td>
              <td className="px-4 py-3 font-bold text-crop-700 dark:text-crop-300">{inr(row.netRealisation)}</td>
              <td className="px-4 py-3">
                <BuyerTrustBadge score={row.buyerTrustScore} />
              </td>
              <td className="px-4 py-3">{row.qualityMatch}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        {t('table.footer')}
      </p>
    </div>
  );
}
