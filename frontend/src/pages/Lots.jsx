import { useEffect, useState } from 'react';
import { lotApi, marketApi } from '../api/client.js';
import CropPicker, { matchCrop } from '../components/CropPicker.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';

export default function Lots() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [lots, setLots] = useState([]);
  const [crops, setCrops] = useState([]);
  const [error, setError] = useState('');
  const [cropsLoading, setCropsLoading] = useState(true);
  const [lotsLoading, setLotsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    cropName: '',
    quantity: 20,
    qualityGrade: 'A',
    harvestDate: new Date().toISOString().slice(0, 10),
    location: user?.address || 'Unjha, Mehsana, Gujarat',
    hasStorage: true,
    storageDaysAvailable: 10,
    latitude: user?.latitude ?? 23.8037,
    longitude: user?.longitude ?? 72.391,
  });

  async function refresh({ silent = false } = {}) {
    if (!silent) setLotsLoading(true);
    try {
      const { lots: rows } = await lotApi.list();
      setLots(rows || []);
    } finally {
      if (!silent) setLotsLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    setCropsLoading(true);
    marketApi
      .crops()
      .then(({ crops: rows }) => {
        if (cancelled) return;
        setCrops(rows || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || t('decide.cropsLoadError'));
      })
      .finally(() => {
        if (!cancelled) setCropsLoading(false);
      });

    refresh().catch((err) => {
      if (!cancelled) setError(err.message);
    });

    return () => {
      cancelled = true;
    };
  }, [t]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    const cropName = form.cropName.trim();
    if (cropName.length < 2) {
      setError(t('lots.cropRequired'));
      return;
    }
    setSaving(true);
    try {
      const matched = matchCrop(crops, cropName);
      await lotApi.create({
        cropId: matched?.id,
        cropName,
        quantity: Number(form.quantity),
        qualityGrade: form.qualityGrade,
        harvestDate: new Date(form.harvestDate).toISOString(),
        location: form.location,
        hasStorage: Boolean(form.hasStorage),
        storageDaysAvailable: form.hasStorage ? Number(form.storageDaysAvailable) || 0 : 0,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      });
      await refresh({ silent: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section>
        <h1 className="text-2xl font-bold text-crop-900 dark:text-crop-100">{t('lots.title')}</h1>
        <div className="mt-4 space-y-3">
          {lots.map((lot) => (
            <article key={lot.id} className="mm-card rounded-xl p-4">
              <p className="font-semibold">
                {lot.crop?.name || t('common.crop')} · {lot.quantity} q · {t('common.grade')} {lot.qualityGrade}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {lot.location} · {lot.status}
                {lot.hasStorage ? ` · ${t('lots.storageOn')}` : ''}
              </p>
            </article>
          ))}
          {lotsLoading && <p className="text-sm text-slate-500 dark:text-slate-400">{t('lots.loading')}</p>}
          {!lotsLoading && !lots.length && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('lots.empty')}</p>
          )}
        </div>
      </section>

      <form className="mm-card space-y-3 p-6" onSubmit={onSubmit}>
        <h2 className="font-semibold text-crop-900 dark:text-crop-100">{t('lots.listTitle')}</h2>
        <CropPicker
          crops={crops}
          value={form.cropName}
          onChange={(cropName) => setForm({ ...form, cropName })}
          loading={cropsLoading}
        />
        <label className="block text-sm">
          {t('common.quantity')}
          <input
            type="number"
            min="0.1"
            step="0.1"
            className="mm-input text-sm"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            required
          />
        </label>
        <label className="block text-sm">
          {t('common.qualityGrade')}
          <select
            className="mm-input text-sm"
            value={form.qualityGrade}
            onChange={(e) => setForm({ ...form, qualityGrade: e.target.value })}
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="FAQ">FAQ</option>
          </select>
        </label>
        <label className="block text-sm">
          {t('common.harvestDate')}
          <input
            type="date"
            className="mm-input text-sm"
            value={form.harvestDate}
            onChange={(e) => setForm({ ...form, harvestDate: e.target.value })}
            required
          />
        </label>
        <label className="block text-sm">
          {t('common.location')}
          <input
            className="mm-input text-sm"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.hasStorage}
            onChange={(e) => setForm({ ...form, hasStorage: e.target.checked })}
          />
          {t('common.storageAvailable')}
        </label>
        {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
        <button
          type="submit"
          disabled={saving || form.cropName.trim().length < 2}
          className="rounded-lg bg-crop-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? t('lots.saving') : t('lots.save')}
        </button>
      </form>
    </div>
  );
}
