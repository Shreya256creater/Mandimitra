import { useEffect, useState } from 'react';
import { fpoApi } from '../api/client.js';
import { useI18n } from '../context/I18nContext.jsx';

export default function FpoDashboard() {
  const { t } = useI18n();
  const [fpos, setFpos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fpoApi
      .list()
      .then(async ({ fpos: rows }) => {
        setFpos(rows);
        if (rows[0]) {
          const dash = await fpoApi.dashboard(rows[0].id);
          setSelected(dash);
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  async function onPick(id) {
    setError('');
    try {
      setSelected(await fpoApi.dashboard(id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-crop-900 dark:text-crop-100">{t('fpo.title')}</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">{t('fpo.subtitle')}</p>
      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {fpos.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onPick(f.id)}
            className={`rounded-full px-3 py-1 text-sm ${
              selected?.fpo?.id === f.id
                ? 'bg-crop-700 text-white'
                : 'border border-crop-200 bg-white dark:border-slate-600 dark:bg-slate-900'
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>

      {selected && (
        <div className="grid gap-4 md:grid-cols-2">
          <section className="mm-card p-5">
            <h2 className="font-semibold">{t('fpo.members')}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {selected.fpo.members.map((m) => (
                <li key={m.id}>
                  {m.user.name}
                  {m.user.village ? ` · ${m.user.village}` : ''}
                </li>
              ))}
            </ul>
          </section>
          <section className="mm-card p-5">
            <h2 className="font-semibold">{t('fpo.aggregated')}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {selected.aggregatedLots.map((row) => (
                <li key={`${row.cropId}-${row.qualityGrade}`}>
                  {row.cropName} {t('common.grade')} {row.qualityGrade}: <strong>{row.totalQuantity} q</strong>{' '}
                  {t('fpo.across', { count: row.lotCount })}
                </li>
              ))}
              {!selected.aggregatedLots.length && (
                <li className="text-slate-500 dark:text-slate-400">{t('fpo.empty')}</li>
              )}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
