import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-crop-900">Welcome, {user?.name}</h1>
      <p className="text-sm text-slate-600">
        Role: <span className="font-semibold">{user?.role}</span>
        {user?.district ? ` · ${user.district}, ${user.state}` : ''}
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/decide" className="rounded-2xl border border-crop-100 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-crop-800">Net realisation decision</h2>
          <p className="mt-2 text-sm text-slate-600">Compare buyers and mandis by take-home profit, not listed price.</p>
        </Link>
        <Link to="/lots" className="rounded-2xl border border-crop-100 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-crop-800">Produce lots</h2>
          <p className="mt-2 text-sm text-slate-600">List quantity, grade, harvest date, and storage so the engine can score options.</p>
        </Link>
        <Link to="/fpo" className="rounded-2xl border border-crop-100 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-crop-800">FPO desk</h2>
          <p className="mt-2 text-sm text-slate-600">Pool small lots and negotiate as one seller.</p>
        </Link>
      </div>
    </div>
  );
}
