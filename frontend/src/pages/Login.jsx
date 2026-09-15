import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'farmer@mandimitra.com', password: 'Farmer@123' });
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { token, user } = await authApi.login(form);
      login(token, user);
      navigate('/decide');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="mm-card mx-auto max-w-md overflow-hidden">
      <div className="bg-crop-700 px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white">
        {t('portal.goi')}
      </div>
      <div className="p-6">
      <h1 className="text-gov-navy text-xl font-bold dark:text-crop-100">{t('login.title')}</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('login.demo')}</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm">
          {t('login.email')}
          <input
            className="mm-input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          {t('login.password')}
          <input
            type="password"
            className="mm-input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
        <button type="submit" className="w-full rounded-lg bg-crop-700 py-2 font-semibold text-white">
          {t('login.submit')}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
        {t('login.newHere')}{' '}
        <Link to="/register" className="font-semibold text-crop-700 dark:text-crop-300">
          {t('login.register')}
        </Link>
      </p>
      </div>
    </div>
  );
}
