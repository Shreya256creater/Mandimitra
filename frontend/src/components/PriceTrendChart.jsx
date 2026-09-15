import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function PriceTrendChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="rounded-2xl border border-dashed border-crop-200 bg-white p-8 text-center text-sm text-slate-500">
        No recent mandi prices for this crop yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-crop-100 bg-white p-4 shadow-sm">
      <h3 className="mb-2 px-1 text-sm font-semibold text-crop-900">Nearby mandi modal price (14 days)</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#dceee0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`₹${v}`, 'Modal']} />
            <Line type="monotone" dataKey="modalPrice" stroke="#2f6f3d" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
