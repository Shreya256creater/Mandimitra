import { useEffect, useState } from 'react';
import { fpoApi } from '../api/client.js';

export default function FpoDashboard() {
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
      <h1 className="text-2xl font-bold text-crop-900">FPO aggregation</h1>
      <p className="text-sm text-slate-600">
        Small lots from member farmers are grouped by crop and grade so the FPO can bargain as one seller.
      </p>
      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {fpos.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onPick(f.id)}
            className={`rounded-full px-3 py-1 text-sm ${
              selected?.fpo?.id === f.id ? 'bg-crop-700 text-white' : 'bg-white border border-crop-200'
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>

      {selected && (
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-crop-100 bg-white p-5">
            <h2 className="font-semibold">Members</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {selected.fpo.members.map((m) => (
                <li key={m.id}>
                  {m.user.name}
                  {m.user.village ? ` · ${m.user.village}` : ''}
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-2xl border border-crop-100 bg-white p-5">
            <h2 className="font-semibold">Aggregated lots</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {selected.aggregatedLots.map((row) => (
                <li key={`${row.cropId}-${row.qualityGrade}`}>
                  {row.cropName} grade {row.qualityGrade}: <strong>{row.totalQuantity} q</strong> across {row.lotCount} lots
                </li>
              ))}
              {!selected.aggregatedLots.length && <li className="text-slate-500">No lots pooled yet.</li>}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
