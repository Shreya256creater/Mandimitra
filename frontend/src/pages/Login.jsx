import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'farmer@mandimitra.test', password: 'Password123!' });
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
    <div className="mx-auto max-w-md rounded-2xl border border-crop-100 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold text-crop-900">Login</h1>
      <p className="mt-1 text-sm text-slate-500">Demo farmer: farmer@mandimitra.test / Password123!</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm">
          Email
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            type="password"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button type="submit" className="w-full rounded-lg bg-crop-700 py-2 font-semibold text-white">
          Sign in
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        New here? <Link to="/register" className="font-semibold text-crop-700">Register</Link>
      </p>
    </div>
  );
}
