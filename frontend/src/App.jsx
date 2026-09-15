import { Navigate, Route, Routes, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { useI18n } from './context/I18nContext.jsx';
import { useTheme } from './context/ThemeContext.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import SellDecisionForm from './pages/SellDecisionForm.jsx';
import DecisionResults from './pages/DecisionResults.jsx';
import Lots from './pages/Lots.jsx';
import FpoDashboard from './pages/FpoDashboard.jsx';
import Dashboard from './pages/Dashboard.jsx';

function Guard({ children }) {
  const { token, loading } = useAuth();
  const { t } = useI18n();
  if (loading) return <p className="p-8 text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function BrandLogo({ className = 'h-12 w-auto' }) {
  return <img src="/logo-mandimitra.png" alt="MandiMitra" className={className} />;
}

function ThemeToggle({ variant = 'light' }) {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useI18n();
  const onTeal = variant === 'teal';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={
        onTeal
          ? 'inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/40 text-white hover:bg-white/10'
          : 'inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:text-crop-100 dark:hover:bg-slate-800'
      }
      aria-label={isDark ? t('theme.toLight') : t('theme.toDark')}
      title={isDark ? t('theme.toLight') : t('theme.toDark')}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M21 14.3A8.5 8.5 0 0 1 9.7 3a7 7 0 1 0 11.3 11.3z" />
        </svg>
      )}
    </button>
  );
}

function LanguageSelect({ variant = 'light' }) {
  const { lang, setLang, t } = useI18n();
  const onTeal = variant === 'teal';

  return (
    <label className="flex items-center gap-1.5">
      <span className={onTeal ? 'hidden text-[11px] text-white/80 sm:inline' : 'hidden text-[11px] text-slate-600 dark:text-slate-300 sm:inline'}>
        {t('lang.label')}
      </span>
      <select
        aria-label={t('lang.label')}
        className={
          onTeal
            ? 'rounded-md border border-white/35 bg-crop-800 px-2 py-1 text-xs font-medium text-white'
            : 'rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-crop-100'
        }
        value={lang}
        onChange={(e) => setLang(e.target.value)}
      >
        <option value="en">{t('lang.en')}</option>
        <option value="hi">{t('lang.hi')}</option>
        <option value="mr">{t('lang.mr')}</option>
      </select>
    </label>
  );
}

function navClass({ isActive }) {
  return `gov-nav-link ${isActive ? 'gov-nav-link-active' : ''}`;
}

function Shell({ children }) {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-crop-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-[60] focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-crop-800"
      >
        {t('portal.skip')}
      </a>

      <div className="gov-tricolor h-1.5 w-full" aria-hidden="true" />

      <div className="border-b border-slate-200 bg-[#f4f7f6] text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-1.5">
          <p className="font-medium tracking-wide">
            {t('portal.goi')}
            <span className="mx-2 text-slate-300 dark:text-slate-700">|</span>
            {t('portal.ministry')}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span>{t('portal.accessibility')}</span>
            <span className="hidden sm:inline">{t('portal.help')}</span>
            <span>{t('portal.contact')}</span>
            <LanguageSelect />
          </div>
        </div>
      </div>

      <header className="border-b border-crop-100 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-4">
            <BrandLogo className="h-9 w-auto shrink-0 sm:h-11" />
            <span className="hidden min-w-0 border-l border-crop-200 pl-4 dark:border-slate-700 sm:block">
              <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-crop-700 dark:text-crop-300 sm:text-xs">
                {t('portal.tagline')}
              </span>
            </span>
          </Link>
          <div className="ml-auto hidden text-right md:block">
            <p className="text-gov-india text-xs font-semibold dark:text-crop-300">{t('portal.digitalIndia')}</p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              {t('portal.lastUpdated')}: 15 Sep 2026
            </p>
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-40 bg-crop-700 shadow-md dark:bg-crop-900">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2">
          <div className="flex flex-wrap items-center gap-1">
            <NavLink to="/" end className={navClass}>
              {t('nav.home')}
            </NavLink>
            <NavLink to="/decide" className={navClass}>
              {t('nav.sellDecision')}
            </NavLink>
            {user && (
              <NavLink to="/dashboard" className={navClass}>
                {t('nav.dashboard')}
              </NavLink>
            )}
            {user && (
              <NavLink to="/lots" className={navClass}>
                {t('nav.lots')}
              </NavLink>
            )}
            {user && (
              <NavLink to="/fpo" className={navClass}>
                {t('nav.fpo')}
              </NavLink>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle variant="teal" />
            {user ? (
              <button
                type="button"
                className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-crop-800 hover:bg-crop-50"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                {t('nav.logout')}
              </button>
            ) : (
              <Link
                to="/login"
                className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-crop-800 hover:bg-crop-50"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        {children}
      </main>

      <footer className="gov-footer mt-auto">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
          <div>
            <p>
              <BrandLogo className="h-10 w-auto" />
            </p>
            <p className="mt-3 text-xs leading-5 text-slate-400">{t('portal.footerNote')}</p>
          </div>
          <div>
            <h2 className="text-gov-saffron text-xs font-semibold uppercase tracking-[0.16em]">{t('portal.services')}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/decide" className="hover:text-white">
                  {t('nav.sellDecision')}
                </Link>
              </li>
              <li>
                <Link to="/lots" className="hover:text-white">
                  {t('nav.lots')}
                </Link>
              </li>
              <li>
                <Link to="/fpo" className="hover:text-white">
                  {t('nav.fpo')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-gov-saffron text-xs font-semibold uppercase tracking-[0.16em]">{t('portal.policies')}</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>{t('portal.privacy')}</li>
              <li>{t('portal.terms')}</li>
              <li>{t('portal.help')}</li>
              <li>{t('portal.contact')}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3 text-[11px] text-slate-400">
            <p>{t('portal.copyright', { year })}</p>
            <p>
              {t('portal.goi')} · {t('portal.ministry')}
            </p>
          </div>
        </div>
        <div className="gov-footer-stripe h-1.5 w-full" aria-hidden="true" />
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/decide"
          element={
            <Guard>
              <SellDecisionForm />
            </Guard>
          }
        />
        <Route
          path="/decide/results"
          element={
            <Guard>
              <DecisionResults />
            </Guard>
          }
        />
        <Route
          path="/lots"
          element={
            <Guard>
              <Lots />
            </Guard>
          }
        />
        <Route
          path="/fpo"
          element={
            <Guard>
              <FpoDashboard />
            </Guard>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Guard>
              <Dashboard />
            </Guard>
          }
        />
      </Routes>
    </Shell>
  );
}
