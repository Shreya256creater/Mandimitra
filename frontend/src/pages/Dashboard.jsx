import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-crop-900 dark:text-crop-100">{t('dashboard.welcome', { name: user?.name })}</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {t('dashboard.role')}: <span className="font-semibold">{user?.role}</span>
        {user?.district ? ` · ${user.district}, ${user.state}` : ''}
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/decide" className="mm-card p-5">
          <h2 className="font-semibold text-crop-800 dark:text-crop-100">{t('dashboard.decideTitle')}</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t('dashboard.decideBody')}</p>
        </Link>
        <Link to="/lots" className="mm-card p-5">
          <h2 className="font-semibold text-crop-800 dark:text-crop-100">{t('dashboard.lotsTitle')}</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t('dashboard.lotsBody')}</p>
        </Link>
        <Link to="/fpo" className="mm-card p-5">
          <h2 className="font-semibold text-crop-800 dark:text-crop-100">{t('dashboard.fpoTitle')}</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t('dashboard.fpoBody')}</p>
        </Link>
      </div>
    </div>
  );
}
