import axios, { type InternalAxiosRequestConfig, type AxiosResponse, AxiosError } from 'axios';

const api = axios.create({
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

// Interceptor para lidar com erros (como o 401 para Refresh Token)
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // Aqui no futuro adicionaremos a lógica de Refresh Token automática!
    return Promise.reject(error);
  }
);

export default api;
