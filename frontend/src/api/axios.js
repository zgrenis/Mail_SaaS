// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/users', // Backend endpoint'inin ana adresi
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