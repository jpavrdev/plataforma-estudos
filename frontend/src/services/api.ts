import axios, { type InternalAxiosRequestConfig, type AxiosResponse, AxiosError } from 'axios';

const api = axios.create({
  withCredentials: true,
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

// Interceptor para adicionar o Access Token em toda requisição
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('@App:accessToken');

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;
let fila: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const url = original?.url ?? '';

    // Só age no 401, e nunca no login/refresh
    if (status !== 401 || url.includes('/login') || url.includes('/refresh')) {
      return Promise.reject(error);
    }

    // Se já tem um refresh em curso, espera na fila
    if (isRefreshing) {
      return new Promise((resolve) => {
        fila.push((token: string) => {
          if (original.headers) original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original)); // refaz a original com o novo token
        });
      });
    }

    // Primeira a chegar: assume o refresh
    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await api.post('/refresh');
      const novoToken = data.token;
      localStorage.setItem('@App:accessToken', novoToken);

      // Libera a fila com o novo token (todas usam o MESMO token)
      fila.forEach((cb) => cb(novoToken));
      fila = [];

      // Refaz a original com o novo token
      if (original.headers) original.headers.Authorization = `Bearer ${novoToken}`;
      return api(original);
    } catch (err) {
      // Refresh falhou (refresh inválido/expirado): desloga
      fila = [];
      localStorage.clear();
      window.location.href = '/';
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
