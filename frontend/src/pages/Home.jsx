import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext.jsx';

const FEATURE_IDS = [
  'mandiPrices',
  'buyerDemand',
  'qualitySpecs',
  'arrivalVolumes',
  'transport',
  'storage',
  'localTrends',
  'saleWindow',
  'verifiedBuyers',
  'lotCreation',
  'qualityGrading',
  'digitalOffers',
  'logistics',
  'paymentTracking',
  'grievance',
  'fpo',
  'records',
];

const OUTCOME_IDS = ['priceDiscovery', 'lowerCost', 'betterRealisation', 'lessLoss', 'reliableBuyers'];

const HERO_SRC = '/images/hero-harvest.png';
const OXEN_SRC = '/images/field-oxen.jpg';
const GROWTH_SRC = '/images/growth-realisation.jpg';
const FARMER_SRC = '/images/farmer-india.jpg';
const TOOLS_SRC = '/images/agri-tools.jpg';

export default function Home() {
  const { t } = useI18n();

  useEffect(() => {
    if (window.location.hash === '#features') {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const services = [
    { title: t('home.card1Title'), body: t('home.card1Body'), to: '/decide', code: '01' },
    { title: t('home.card2Title'), body: t('home.card2Body'), to: '/decide', code: '02' },
    { title: t('home.card3Title'), body: t('home.card3Body'), to: '/decide', code: '03' },
  ];

  return (
    <div>
      <section className="relative isolate h-[min(78vh,52rem)] min-h-[28rem] overflow-hidden bg-[#1c2612]">
        <img
          src={HERO_SRC}
          alt={t('home.photoAlt')}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-[#1c2612]" />
        <div className="relative z-10 mx-auto flex h-full min-h-[28rem] max-w-4xl flex-col items-center justify-center px-6 py-20 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] sm:text-sm">{t('home.kicker')}</p>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight text-[#f4ead6] sm:text-5xl md:text-6xl">
            {t('home.heroTitle')}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/90 sm:text-base">{t('home.body')}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/decide"
              className="rounded-md bg-white px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.14em] text-[#243018] hover:bg-[#f4ead6]"
            >
              {t('home.ctaDecide')}
            </Link>
            <a
              href="#features"
              className="text-xs font-semibold uppercase tracking-[0.28em] text-white underline decoration-white/60 underline-offset-8 hover:decoration-white"
            >
              {t('home.learnMore')}
            </a>
          </div>
        </div>
      </section>

      <section className="farm-olive px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="farm-gold text-center text-2xl font-bold uppercase tracking-[0.2em] sm:text-3xl">
            {t('home.overviewTitle')}
          </h2>
          <div className="mt-12 grid items-stretch gap-8 md:grid-cols-2">
            <img
              src={GROWTH_SRC}
              alt={t('home.photoAltGrowth')}
              className="farm-photo min-h-[20rem] object-cover object-center"
            />
            <article className="farm-panel flex flex-col justify-center p-8 sm:p-10">
              <h3 className="text-2xl font-semibold leading-snug text-white">{t('home.overviewLead')}</h3>
              <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-[#d7c07a]">
                {t('home.servicesTitle')}
              </p>
              <p className="mt-4 text-sm leading-7 text-[#f4ead6]/85">{t('home.overviewBody')}</p>
              <Link to="/decide" className="mt-6 text-sm font-semibold text-[#d7c07a] hover:text-white">
                {t('home.openService')} ›
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="farm-olive-deep px-4 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-stretch gap-8 md:grid-cols-2">
          <article className="farm-panel order-2 flex flex-col justify-center p-8 md:order-1 sm:p-10">
            <h3 className="text-2xl font-semibold leading-snug text-white">{t('home.tasksTitle')}</h3>
            <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-[#d7c07a]">{t('home.tasksLead')}</p>
            <p className="mt-4 text-sm leading-7 text-[#f4ead6]/85">{t('home.tasksBody')}</p>
            <Link to="/register" className="mt-6 text-sm font-semibold text-[#d7c07a] hover:text-white">
              {t('home.ctaRegister')} ›
            </Link>
          </article>
          <img
            src={FARMER_SRC}
            alt={t('home.photoAltFarmer')}
            className="farm-photo order-1 min-h-[20rem] bg-[#f4ead6] object-contain p-4 md:order-2"
          />
        </div>
      </section>

      <section id="features" className="farm-olive scroll-mt-28 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="farm-gold text-center text-2xl font-bold uppercase tracking-[0.2em] sm:text-3xl">
            {t('home.featuresTitle')}
          </h2>
          <img
            src={TOOLS_SRC}
            alt={t('home.photoAltTools')}
            className="mx-auto mt-10 max-h-80 w-full rounded-3xl object-contain"
          />
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {FEATURE_IDS.map((id) => (
              <li key={id} className="farm-panel bg-[#1c2612]/50 px-4 py-4 text-sm font-medium text-[#f4ead6]">
                {t(`home.feature.${id}`)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="farm-olive-deep px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="farm-gold text-center text-2xl font-bold uppercase tracking-[0.2em] sm:text-3xl">
            {t('home.outcomesTitle')}
          </h2>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {OUTCOME_IDS.map((id) => (
              <li
                key={id}
                className="farm-panel px-4 py-6 text-center text-sm font-semibold leading-6 text-white"
              >
                {t(`home.outcome.${id}`)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="farm-olive px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="farm-gold text-center text-2xl font-bold uppercase tracking-[0.2em] sm:text-3xl">
            {t('home.servicesTitle')}
          </h2>
          <img
            src={OXEN_SRC}
            alt={t('home.photoAltOxen')}
            className="mx-auto mt-10 max-h-[36rem] w-full rounded-3xl object-contain object-bottom"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {services.map((card) => (
              <article key={card.code} className="farm-panel flex flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                  <span className="text-[11px] font-semibold text-[#d7c07a]">{card.code}</span>
                </div>
                <p className="mt-3 flex-1 text-sm leading-6 text-[#f4ead6]/80">{card.body}</p>
                <Link to={card.to} className="mt-5 text-sm font-semibold text-[#d7c07a] hover:text-white">
                  {t('home.openService')} ›
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
