import BuyerTrustBadge from './BuyerTrustBadge.jsx';

function inr(n) {
  return `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function NetRealisationTable({ options = [] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-crop-100 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-crop-100/70 text-crop-900">
          <tr>
            <th className="px-4 py-3 font-semibold">Rank</th>
            <th className="px-4 py-3 font-semibold">Buyer / market</th>
            <th className="px-4 py-3 font-semibold">Listed price</th>
            <th className="px-4 py-3 font-semibold">Transport</th>
            <th className="px-4 py-3 font-semibold">Storage</th>
            <th className="px-4 py-3 font-semibold">Net realisation</th>
            <th className="px-4 py-3 font-semibold">Trust</th>
            <th className="px-4 py-3 font-semibold">Quality match</th>
          </tr>
        </thead>
        <tbody>
          {options.map((row, i) => (
            <tr key={`${row.optionType}-${row.buyerId || row.marketId}-${i}`} className="border-t border-slate-100">
              <td className="px-4 py-3 font-semibold text-crop-700">{i + 1}</td>
              <td className="px-4 py-3">
                <div className="font-medium">{row.buyerOrMarketName}</div>
                <div className="text-xs text-slate-500">
                  {row.optionType === 'MARKET' ? 'Mandi' : 'Buyer'} · {row.distanceKm?.toFixed?.(0) ?? '—'} km
                </div>
              </td>
              <td className="px-4 py-3">{inr(row.offerPrice)}</td>
              <td className="px-4 py-3 text-slate-600">−{inr(row.transportCost)}</td>
              <td className="px-4 py-3 text-slate-600">−{inr(row.storageCost)}</td>
              <td className="px-4 py-3 font-bold text-crop-700">{inr(row.netRealisation)}</td>
              <td className="px-4 py-3">
                <BuyerTrustBadge score={row.buyerTrustScore} />
              </td>
              <td className="px-4 py-3">{row.qualityMatch}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
        Ranked by net realisation (₹/quintal after transport and storage), not by the headline offer price.
      </p>
    </div>
  );
}
