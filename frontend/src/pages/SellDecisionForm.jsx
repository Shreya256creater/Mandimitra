import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { decisionApi, marketApi } from '../api/client.js';
import CropPicker, { matchCrop } from '../components/CropPicker.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';

export default function SellDecisionForm() {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [error, setError] = useState('');
  const [cropsLoading, setCropsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    cropName: '',
    quantity: 40,
    qualityGrade: 'A',
    location: user?.address || user?.district
      ? `${user.address || `${user.village || user.district}, ${user.state || 'Gujarat'}`}`
      : 'Unjha, Mehsana, Gujarat',
    harvestDate: new Date().toISOString().slice(0, 10),
    hasStorage: true,
    storageDaysAvailable: 10,
    latitude: user?.latitude ?? 23.8037,
    longitude: user?.longitude ?? 72.391,
  });

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
    return () => {
      cancelled = true;
    };
  }, [t]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    const cropName = form.cropName.trim();
    if (cropName.length < 2) {
      setError(t('decide.cropRequired'));
      return;
    }
    setLoading(true);
    try {
      const matched = matchCrop(crops, cropName);
      const result = await decisionApi.evaluate({
        cropId: matched?.id,
        cropName,
        quantity: Number(form.quantity),
        qualityGrade: form.qualityGrade,
        location: form.location,
        harvestDate: new Date(form.harvestDate).toISOString(),
        hasStorage: Boolean(form.hasStorage),
        storageDaysAvailable: Number(form.storageDaysAvailable) || 0,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      });
      sessionStorage.setItem('mm_last_decision', JSON.stringify(result));
      navigate('/decide/results');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-crop-700 dark:text-crop-300">
        {t('home.servicesTitle')}
      </p>
      <h1 className="text-gov-navy mt-1 text-2xl font-bold dark:text-crop-100">{t('decide.title')}</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t('decide.subtitle')}</p>

      <form className="mm-card mt-6 space-y-4 p-6" onSubmit={onSubmit}>
        <CropPicker
          crops={crops}
          value={form.cropName}
          onChange={(cropName) => setForm({ ...form, cropName })}
          loading={cropsLoading}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            {t('common.quantity')}
            <input
              type="number"
              min="0.1"
              step="0.1"
              className="mm-input"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            {t('common.qualityGrade')}
            <select
              className="mm-input"
              value={form.qualityGrade}
              onChange={(e) => setForm({ ...form, qualityGrade: e.target.value })}
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="FAQ">FAQ</option>
            </select>
          </label>
        </div>

        <label className="block text-sm">
          {t('common.location')}
          <input
            className="mm-input"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            {t('common.harvestDate')}
            <input
              type="date"
              className="mm-input"
              value={form.harvestDate}
              onChange={(e) => setForm({ ...form, harvestDate: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            {t('common.storageDays')}
            <input
              type="number"
              min="0"
              className="mm-input"
              value={form.storageDaysAvailable}
              onChange={(e) => setForm({ ...form, storageDaysAvailable: e.target.value })}
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.hasStorage}
            onChange={(e) => setForm({ ...form, hasStorage: e.target.checked })}
          />
          {t('decide.hasStorage')}
        </label>

        {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
        <button
          type="submit"
          disabled={loading || form.cropName.trim().length < 2}
          className="rounded-lg bg-crop-700 px-5 py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {loading ? t('decide.submitting') : t('decide.submit')}
        </button>
      </form>
    </div>
  );
}
