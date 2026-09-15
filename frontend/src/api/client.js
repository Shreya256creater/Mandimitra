const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('mm_token');
}

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && getToken()) {
    headers.Authorization = `Bearer ${getToken()}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const authApi = {
  login: (body) => api('/auth/login', { method: 'POST', body, auth: false }),
  register: (body) => api('/auth/register', { method: 'POST', body, auth: false }),
  me: () => api('/auth/me'),
};

export const marketApi = {
  crops: () => api('/market/crops', { auth: false }),
  markets: () => api('/market/markets', { auth: false }),
  prices: (params) => {
    const qs = new URLSearchParams(params).toString();
    return api(`/market/prices?${qs}`, { auth: false });
  },
};

export const decisionApi = {
  evaluate: (body) => api('/decision-engine/evaluate', { method: 'POST', body }),
};

export const lotApi = {
  list: () => api('/lots'),
  create: (body) => api('/lots', { method: 'POST', body }),
};

export const fpoApi = {
  list: () => api('/fpo'),
  dashboard: (id) => api(`/fpo/${id}`),
};
