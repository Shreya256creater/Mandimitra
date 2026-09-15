import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import DecisionCard from '../components/DecisionCard.jsx';
import NetRealisationTable from '../components/NetRealisationTable.jsx';
import PriceTrendChart from '../components/PriceTrendChart.jsx';
import SellTimingBanner from '../components/SellTimingBanner.jsx';
import { useI18n } from '../context/I18nContext.jsx';

export default function DecisionResults() {
  const { t } = useI18n();
  const result = useMemo(() => {
    const raw = sessionStorage.getItem('mm_last_decision');
    return raw ? JSON.parse(raw) : null;
  }, []);

  if (!result) {
    return (
      <div className="rounded-2xl border border-dashed border-crop-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-300">{t('results.empty')}</p>
        <Link to="/decide" className="mt-3 inline-block font-semibold text-crop-700 dark:text-crop-300">
          {t('results.goForm')}
        </Link>
      </div>
    );
  }

  const top = result.rankedOptions?.[0];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-crop-600 dark:text-crop-300">
          {result.crop?.name} · {result.quantity} q · {t('common.grade')} {result.qualityGrade}
        </p>
        <h1 className="text-2xl font-bold text-crop-900 dark:text-crop-100">{t('results.title')}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">{t('results.subtitle')}</p>
      </div>

      <SellTimingBanner advice={result.sellTimingRecommendation} reasoning={result.reasoning} />

      <PriceTrendChart data={result.priceTrend} />

      {top && <DecisionCard option={top} rank={1} />}

      <NetRealisationTable options={result.rankedOptions} />

      <Link to="/decide" className="inline-block text-sm font-semibold text-crop-700 dark:text-crop-300">
        {t('results.again')}
      </Link>
    </div>
  );
}
