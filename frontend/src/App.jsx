import { Navigate, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
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
  if (loading) return <p className="p-8 text-sm text-slate-500">Loading…</p>;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function Shell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <header className="border-b border-crop-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-crop-800">
            MandiMitra
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-crop-700">
            <Link to="/decide">Sell decision</Link>
            {user && <Link to="/dashboard">Dashboard</Link>}
            {user && <Link to="/lots">Lots</Link>}
            {user && <Link to="/fpo">FPO</Link>}
            {user ? (
              <button
                type="button"
                className="rounded-full bg-crop-700 px-3 py-1 text-white"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Logout
              </button>
            ) : (
              <Link to="/login" className="rounded-full bg-crop-700 px-3 py-1 text-white">
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
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
