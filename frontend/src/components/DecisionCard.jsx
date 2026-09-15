import BuyerTrustBadge from './BuyerTrustBadge.jsx';

function inr(n) {
  return `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function DecisionCard({ option, rank }) {
  return (
    <article className="rounded-2xl border border-crop-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-crop-600">Rank #{rank}</p>
          <h3 className="mt-1 text-lg font-semibold text-crop-900">{option.buyerOrMarketName}</h3>
          <p className="text-sm text-slate-500">
            {option.optionType === 'MARKET' ? 'Mandi modal price' : 'Digital buyer offer'}
            {option.district ? ` · ${option.district}, ${option.state}` : ''}
          </p>
        </div>
        <BuyerTrustBadge score={option.buyerTrustScore} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-slate-500">Listed price</dt>
          <dd className="font-medium">{inr(option.offerPrice)}/q</dd>
        </div>
        <div>
          <dt className="text-slate-500">Transport</dt>
          <dd className="font-medium">−{inr(option.transportCost)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Storage</dt>
          <dd className="font-medium">−{inr(option.storageCost)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Net realisation</dt>
          <dd className="text-base font-bold text-crop-700">{inr(option.netRealisation)}/q</dd>
        </div>
      </dl>

      <p className="mt-4 text-sm text-slate-600">{option.notes}</p>
      {option.qualityMatch < 100 && (
        <p className="mt-2 text-xs font-medium text-amber-700">
          Quality match {option.qualityMatch}% — grade may not meet this buyer’s minimum.
        </p>
      )}
    </article>
  );
}
