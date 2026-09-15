import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { decisionApi, marketApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function SellDecisionForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    cropId: '',
    quantity: 40,
    qualityGrade: 'A',
    location: user?.address || 'Niphad, Nashik, Maharashtra',
    harvestDate: new Date().toISOString().slice(0, 10),
    hasStorage: true,
    storageDaysAvailable: 10,
    latitude: user?.latitude ?? 20.0793,
    longitude: user?.longitude ?? 74.1102,
  });

  useEffect(() => {
    marketApi.crops().then(({ crops: rows }) => {
      setCrops(rows);
      if (rows[0]) setForm((f) => ({ ...f, cropId: rows[0].id }));
    });
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await decisionApi.evaluate({
        ...form,
        quantity: Number(form.quantity),
        storageDaysAvailable: Number(form.storageDaysAvailable),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        harvestDate: new Date(form.harvestDate).toISOString(),
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
      <h1 className="text-2xl font-bold text-crop-900">Ask MandiMitra where to sell</h1>
      <p className="mt-1 text-sm text-slate-600">
        We will rank buyers and mandis by net realisation — listed price minus transport and storage — and
        attach sell-timing plus buyer trust.
      </p>

      <form className="mt-6 space-y-4 rounded-2xl border border-crop-100 bg-white p-6 shadow-sm" onSubmit={onSubmit}>
        <label className="block text-sm">
          Crop
          <select
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            value={form.cropId}
            onChange={(e) => setForm({ ...form, cropId: e.target.value })}
            required
          >
            {crops.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            Quantity (quintals)
            <input
              type="number"
              min="0.1"
              step="0.1"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            Quality grade
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
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
          Location
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            Harvest date
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={form.harvestDate}
              onChange={(e) => setForm({ ...form, harvestDate: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            Storage days available
            <input
              type="number"
              min="0"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
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
          I have usable storage (godown / cold store / farm store)
        </label>

        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-crop-700 px-5 py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Calculating net realisation…' : 'Evaluate sell options'}
        </button>
      </form>
    </div>
  );
}
