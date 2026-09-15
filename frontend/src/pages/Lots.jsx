import { useEffect, useState } from 'react';
import { lotApi, marketApi } from '../api/client.js';

export default function Lots() {
  const [lots, setLots] = useState([]);
  const [crops, setCrops] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    cropId: '',
    quantity: 20,
    qualityGrade: 'A',
    harvestDate: new Date().toISOString().slice(0, 10),
    location: 'Niphad, Nashik, Maharashtra',
    hasStorage: true,
    latitude: 20.0793,
    longitude: 74.1102,
  });

  async function refresh() {
    const { lots: rows } = await lotApi.list();
    setLots(rows);
  }

  useEffect(() => {
    marketApi.crops().then(({ crops: rows }) => {
      setCrops(rows);
      if (rows[0]) setForm((f) => ({ ...f, cropId: rows[0].id }));
    });
    refresh().catch((err) => setError(err.message));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await lotApi.create({
        ...form,
        quantity: Number(form.quantity),
        harvestDate: new Date(form.harvestDate).toISOString(),
      });
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section>
        <h1 className="text-2xl font-bold text-crop-900">Your lots</h1>
        <div className="mt-4 space-y-3">
          {lots.map((lot) => (
            <article key={lot.id} className="rounded-xl border border-crop-100 bg-white p-4">
              <p className="font-semibold">
                {lot.crop?.name} · {lot.quantity} q · grade {lot.qualityGrade}
              </p>
              <p className="text-sm text-slate-500">
                {lot.location} · {lot.status}
                {lot.hasStorage ? ' · storage available' : ''}
              </p>
            </article>
          ))}
          {!lots.length && <p className="text-sm text-slate-500">No lots listed yet.</p>}
        </div>
      </section>

      <form className="space-y-3 rounded-2xl border border-crop-100 bg-white p-6" onSubmit={onSubmit}>
        <h2 className="font-semibold text-crop-900">List a lot</h2>
        <select
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={form.cropId}
          onChange={(e) => setForm({ ...form, cropId: e.target.value })}
        >
          {crops.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        />
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button type="submit" className="rounded-lg bg-crop-700 px-4 py-2 text-sm font-semibold text-white">
          Save lot
        </button>
      </form>
    </div>
  );
}
