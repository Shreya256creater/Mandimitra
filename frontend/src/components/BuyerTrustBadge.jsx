export default function BuyerTrustBadge({ score }) {
  const value = Number(score) || 0;
  let tone = 'bg-amber-100 text-amber-900';
  let label = 'Moderate trust';
  if (value >= 80) {
    tone = 'bg-emerald-100 text-emerald-800';
    label = 'High trust';
  } else if (value < 55) {
    tone = 'bg-rose-100 text-rose-800';
    label = 'Pay-delay risk';
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      Trust {value.toFixed(0)}
      <span className="font-normal opacity-80">· {label}</span>
    </span>
  );
}
