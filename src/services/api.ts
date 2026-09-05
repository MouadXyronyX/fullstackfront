import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const BACKUP_API_URL = import.meta.env.VITE_BACKUP_API_URL || '';

let activeBaseURL = API_BASE_URL;
let backendAvailable = true;
const REQUEST_TIMEOUT = 12000;
const HEALTH_CHECK_INTERVAL = 120000; // 2 minutes
const HEALTH_CHECK_TIMEOUT = 8000;

export function getActiveBaseURL() {
  return activeBaseURL;
}

export function isBackendAvailable() {
  return backendAvailable;
}

export function getActiveWsURL(path: string) {
  const base = activeBaseURL;
  if (!base) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}${path}`;
  }
  const protocol = base.startsWith('https') ? 'wss' : 'ws';
  return `${protocol}://${base.replace(/^https?:\/\//, '')}${path}`;
}

async function checkPrimaryHealth() {
  if (!API_BASE_URL) return;
  try {
    await axios.get(`${API_BASE_URL}/api/settings/public`, {
      timeout: HEALTH_CHECK_TIMEOUT,
      headers: { 'Accept': 'application/json' },
    });
    activeBaseURL = API_BASE_URL;
    backendAvailable = true;
  } catch {
    activeBaseURL = BACKUP_API_URL || API_BASE_URL;
    backendAvailable = !!BACKUP_API_URL;
  }
}

if (BACKUP_API_URL) {
  setInterval(checkPrimaryHealth, HEALTH_CHECK_INTERVAL);
}

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: REQUEST_TIMEOUT,
});

// --- Request Cache + Deduplication ---
const CACHE_TTL = 30000; // 30 seconds
const responseCache = new Map<string, { data: any; expiry: number }>();
const inflightRequests = new Map<string, Promise<any>>();

function getCacheKey(config: InternalAxiosRequestConfig): string | null {
  if (config.method !== 'get') return null;
  return `${config.method}:${config.baseURL || ''}${config.url || ''}:${JSON.stringify(config.params || {})}`;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  (config as any)._targetURL = activeBaseURL;
  config.baseURL = `${activeBaseURL}/api`;
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Deduplicate in-flight GET requests
  if (config.method === 'get') {
    const key = getCacheKey(config);
    if (key) {
      const cached = responseCache.get(key);
      if (cached && cached.expiry > Date.now()) {
        // Return cached data directly via custom adapter
        config.adapter = () => Promise.resolve({
          data: cached.data,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
        return config;
      }
      const inflight = inflightRequests.get(key);
      if (inflight) {
        config.adapter = () => inflight.then(data => ({
          data,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }));
        return config;
      }
      // Track this request as in-flight
      let resolveInflight: (data: any) => void;
      inflightRequests.set(key, new Promise(r => { resolveInflight = r; }));
      const origAdapter = config.adapter;
      config.adapter = (cfg) => {
        return (origAdapter || axios.defaults.adapter)(cfg).then((resp: any) => {
          resolveInflight!(resp.data);
          inflightRequests.delete(key);
          return resp;
        }).catch((err: any) => {
          inflightRequests.delete(key);
          throw err;
        });
      };
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    // Cache GET responses
    const key = getCacheKey(response.config);
    if (key) {
      responseCache.set(key, { data: response.data, expiry: Date.now() + CACHE_TTL });
      inflightRequests.delete(key);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _retried?: boolean };

    // Immediate failover to backup server when primary is unreachable.
    // Trigger on network error (no response / timeout) OR gateway errors (502/503/504),
    // but only if THIS request was aimed at primary and hasn't already been retried.
    const targetURL = (originalRequest as any)._targetURL || activeBaseURL;
    const wasTargetingPrimary = targetURL === API_BASE_URL;
    const isGatewayError =
      !!error.response &&
      [502, 503, 504].includes(error.response.status);
    if (
      BACKUP_API_URL &&
      wasTargetingPrimary &&
      !originalRequest._retried &&
      (!error.response || isGatewayError)
    ) {
      originalRequest._retried = true;
      activeBaseURL = BACKUP_API_URL;
      backendAvailable = false;
      return api(originalRequest);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${activeBaseURL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token, refresh_token } = res.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }

    const msg = (error.response?.data as any)?.detail || error.message;
    if (error.response?.status !== 401) {
      toast.error(msg);
    }
    return Promise.reject(error);
  }
);

export default api;

// Cache invalidation — call after create/update/delete operations
export function invalidateCache(pattern?: string) {
  if (pattern) {
    for (const key of responseCache.keys()) {
      if (key.includes(pattern)) responseCache.delete(key);
    }
  } else {
    responseCache.clear();
  }
}

// Auth
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  adminLogin: (data: any) => api.post('/auth/admin-login', data),
  adminLoginTOTP: (code: string, userId: number) => api.post(`/auth/admin-login-totp?user_id=${userId}`, { code }),
  refresh: (data: any) => api.post('/auth/refresh', data),
  me: () => api.get('/auth/me'),
  setupTOTP: () => api.post('/auth/totp/setup'),
  verifyEnableTOTP: (code: string) => api.post('/auth/totp/verify-enable', { code }),
  disableTOTP: () => api.post('/auth/totp/disable'),
};

// Products
export const productsAPI = {
  list: (params?: any) => api.get('/products/', { params }),
  get: (id: number) => api.get(`/products/${id}`),
  create: (data: any) => { invalidateCache('/products/'); return api.post('/products/', data); },
  update: (id: number, data: any) => { invalidateCache('/products/'); return api.put(`/products/${id}`, data); },
  delete: (id: number) => { invalidateCache('/products/'); return api.delete(`/products/${id}`); },
  count: (params?: any) => api.get('/products/count', { params }),
};

// Upload
export const uploadAPI = {
  image: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Categories
export const categoriesAPI = {
  list: () => api.get('/categories/'),
  get: (id: number) => api.get(`/categories/${id}`),
  create: (data: any) => { invalidateCache('/categories/'); return api.post('/categories/', data); },
  update: (id: number, data: any) => { invalidateCache('/categories/'); return api.put(`/categories/${id}`, data); },
  delete: (id: number) => { invalidateCache('/categories/'); return api.delete(`/categories/${id}`); },
};

// Orders
export const ordersAPI = {
  list: (params?: any) => api.get('/orders/', { params }),
  get: (id: number) => api.get(`/orders/${id}`),
  myOrders: () => api.get('/orders/my-orders'),
  create: (data: any) => api.post('/orders/', data),
  updateStatus: (id: number, status: string) => api.put(`/orders/${id}/status`, { status }),
  delete: (id: number) => api.delete(`/orders/${id}`),
  track: (orderCode: string) => api.get('/orders/track', { params: { order_code: orderCode } }),
};

// Pages
export const pagesAPI = {
  listPublished: () => api.get('/pages/'),
  listAll: () => api.get('/pages/all'),
  getBySlug: (slug: string) => api.get(`/pages/by-slug/${slug}`),
  get: (id: number) => api.get(`/pages/${id}`),
  create: (data: any) => api.post('/pages/', data),
  update: (id: number, data: any) => api.put(`/pages/${id}`, data),
  delete: (id: number) => api.delete(`/pages/${id}`),
};

// Users
export const usersAPI = {
  list: () => api.get('/users/'),
  get: (id: number) => api.get(`/users/${id}`),
  update: (id: number, data: any) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
  resetPassword: (id: number, newPassword: string) => api.put(`/users/${id}/password`, { new_password: newPassword }),
};

// Chats
export const chatsAPI = {
  list: (params?: any) => api.get('/chats/', { params }),
  myChats: () => api.get('/chats/my'),
  get: (id: number) => api.get(`/chats/${id}`),
  getOrCreateGuest: (identifier: string, productId?: number) =>
    api.get(`/chats/guest/${identifier}`, { params: { product_id: productId } }),
  create: (data: any) => api.post('/chats/', data),
  sendMessage: (chatId: number, data: any) => api.post(`/chats/${chatId}/messages`, data),
};

// Settings
export const settingsAPI = {
  getPublic: () => api.get('/settings/public'),
  getAll: () => api.get('/settings/'),
  getGeneral: () => api.get('/settings/general'),
  updateGeneral: (data: any) => api.put('/settings/general', data),
  getDeliveryWilayas: () => api.get('/settings/delivery-wilayas'),
  updateDeliveryWilayas: (items: any[]) => api.put('/settings/delivery-wilayas', { items }),
};

// Dashboard
export const dashboardAPI = {
  stats: () => api.get('/dashboard/stats'),
};
