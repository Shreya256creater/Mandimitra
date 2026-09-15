import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';

export default function Register() {
  const { login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'FARMER',
    district: 'Nashik',
    state: 'Maharashtra',
    businessName: '',
  });
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { token, user } = await authApi.register({
        ...form,
        latitude: 20.0793,
        longitude: 74.1102,
      });
      login(token, user);
      navigate('/decide');
    } catch (err) {
      setError(err.message);
    }
  }

  const fields = [
    { key: 'name', label: t('register.name') },
    { key: 'email', label: t('register.email') },
    { key: 'password', label: t('register.password'), type: 'password' },
  ];

  return (
    <div className="mm-card mx-auto max-w-md overflow-hidden">
      <div className="bg-crop-700 px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white">
        {t('portal.goi')}
      </div>
      <div className="p-6">
      <h1 className="text-gov-navy text-xl font-bold dark:text-crop-100">{t('register.title')}</h1>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        {fields.map((field) => (
          <label key={field.key} className="block text-sm">
            {field.label}
            <input
              type={field.type || 'text'}
              className="mm-input"
              value={form[field.key]}
              onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              required
            />
          </label>
        ))}
        <label className="block text-sm">
          {t('register.role')}
          <select
            className="mm-input"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="FARMER">{t('register.farmer')}</option>
            <option value="FPO">{t('register.fpo')}</option>
            <option value="BUYER">{t('register.buyer')}</option>
          </select>
        </label>
        {form.role === 'BUYER' && (
          <label className="block text-sm">
            {t('register.businessName')}
            <input
              className="mm-input"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
            />
          </label>
        )}
        {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
        <button type="submit" className="w-full rounded-lg bg-crop-700 py-2 font-semibold text-white">
          {t('register.submit')}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
        {t('register.already')}{' '}
        <Link to="/login" className="font-semibold text-crop-700 dark:text-crop-300">
          {t('register.login')}
        </Link>
      </p>
      </div>
    </div>
  );
}
