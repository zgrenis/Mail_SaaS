import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}`  , // Base url for endpoints
});

// Her istekten önce çalışacak aracı (interceptor)
// Eğer localStorage'da token varsa, isteğin Header'ına ekler.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Backend'indeki authMiddleware genelde "Bearer <token>" formatını bekler
    config.headers.Authorization = `Bearer ${token}`; 
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;