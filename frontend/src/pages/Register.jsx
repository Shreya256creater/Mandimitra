import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { login } = useAuth();
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

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-crop-100 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold text-crop-900">Create account</h1>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        {['name', 'email', 'password'].map((field) => (
          <label key={field} className="block text-sm capitalize">
            {field}
            <input
              type={field === 'password' ? 'password' : 'text'}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              required
            />
          </label>
        ))}
        <label className="block text-sm">
          Role
          <select
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="FARMER">Farmer</option>
            <option value="FPO">FPO</option>
            <option value="BUYER">Buyer</option>
          </select>
        </label>
        {form.role === 'BUYER' && (
          <label className="block text-sm">
            Business name
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
            />
          </label>
        )}
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button type="submit" className="w-full rounded-lg bg-crop-700 py-2 font-semibold text-white">
          Register
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already registered? <Link to="/login" className="font-semibold text-crop-700">Login</Link>
      </p>
    </div>
  );
}
