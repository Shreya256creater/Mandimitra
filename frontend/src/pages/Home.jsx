import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext.jsx';

export default function Home() {
  const { t } = useI18n();
  const services = [
    { title: t('home.card1Title'), body: t('home.card1Body'), to: '/decide', code: '01' },
    { title: t('home.card2Title'), body: t('home.card2Body'), to: '/decide', code: '02' },
    { title: t('home.card3Title'), body: t('home.card3Body'), to: '/decide', code: '03' },
  ];

  return (
    <div className="space-y-8">
      <p className="rounded-lg border border-crop-100 border-l-4 bg-white px-4 py-2.5 text-center text-xs font-medium text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-crop-100" style={{ borderLeftColor: '#FF9933' }}>
        {t('home.notice')}
      </p>

      <section className="overflow-hidden rounded-2xl bg-crop-700 text-white shadow-md dark:bg-crop-900">
        <div className="bg-white/5 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-crop-100">
          {t('home.kicker')}
        </div>
        <div className="px-6 py-10 sm:px-10">
          <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">{t('home.title')}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-crop-50 sm:text-base">{t('home.body')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/decide" className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-crop-900 hover:bg-crop-50">
              {t('home.ctaDecide')}
            </Link>
            <Link to="/register" className="mm-btn-outline">
              {t('home.ctaRegister')}
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-gov-navy text-lg font-bold dark:text-white">{t('home.servicesTitle')}</h2>
          <p className="text-xs font-medium uppercase tracking-wider text-crop-700 dark:text-crop-300">
            {t('portal.tagline')}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {services.map((card) => (
            <article key={card.code} className="mm-card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-gov-navy font-semibold dark:text-crop-100">{card.title}</h3>
                <span className="rounded-full bg-crop-50 px-2 py-0.5 text-[11px] font-semibold text-crop-800 dark:bg-slate-800 dark:text-crop-200">
                  {card.code}
                </span>
              </div>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{card.body}</p>
              <Link
                to={card.to}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-crop-700 dark:text-crop-300"
              >
                {t('home.openService')}
                <span aria-hidden="true">›</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-crop-100 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-3">
        <h2 className="sr-only">{t('home.snapshotTitle')}</h2>
        {[t('home.snapshot1'), t('home.snapshot2'), t('home.snapshot3')].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-crop-100 bg-crop-50 px-4 py-3 text-sm font-semibold text-crop-900 dark:border-slate-700 dark:bg-slate-800 dark:text-crop-100"
          >
            {item}
          </div>
        ))}
      </section>
    </div>
  );
}
