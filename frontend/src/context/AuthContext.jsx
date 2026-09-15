import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('mm_token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('mm_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(({ user: next }) => {
        setUser(next);
        localStorage.setItem('mm_user', JSON.stringify(next));
      })
      .catch(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('mm_token');
        localStorage.removeItem('mm_user');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login: (nextToken, nextUser) => {
        localStorage.setItem('mm_token', nextToken);
        localStorage.setItem('mm_user', JSON.stringify(nextUser));
        setToken(nextToken);
        setUser(nextUser);
      },
      logout: () => {
        localStorage.removeItem('mm_token');
        localStorage.removeItem('mm_user');
        setToken(null);
        setUser(null);
      },
    }),
    [token, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
