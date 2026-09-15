import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-gradient-to-br from-crop-700 to-crop-900 px-8 py-14 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-crop-100">Not a marketplace clone</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight">
          MandiMitra tells farmers what they actually take home — not just who offered the highest price.
        </h1>
        <p className="mt-4 max-w-2xl text-crop-50">
          The Net Realisation Engine subtracts transport, storage, quality mismatch, and buyer payment risk
          from the listed rate, then ranks options and advises whether to sell now, wait, or split the lot.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/decide" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-crop-800">
            Get a sell decision
          </Link>
          <Link to="/register" className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold">
            Create farmer account
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: 'Best net realisation',
            body: 'Ranked by ₹/quintal after distance-based transport and storage cost — a far mandi with a higher ticket can still lose.',
          },
          {
            title: 'Sell timing advice',
            body: 'SELL_NOW, WAIT_FEW_DAYS, or SELL_PART_STORE_REST from a 7–14 day mandi price trend. Rule-based today, swappable for ML later.',
          },
          {
            title: 'Buyer trust score',
            body: 'On-time payment rate, completed deals, and payment delay — shown beside every recommendation so cash-flow risk is visible.',
          },
        ].map((card) => (
          <article key={card.title} className="rounded-2xl border border-crop-100 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-crop-900">{card.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{card.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
