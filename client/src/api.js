import axios from 'axios';

const api = axios.create({
baseURL: 'https://app-vwh7.onrender.com/api/',});

api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- FIX IS HERE ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if it's a 401 error
    if (error.response && error.response.status === 401) {
      
      // ⚠️ CRITICAL FIX:
      // Only force logout if the URL was NOT '/user/login'
      // This prevents the page from reloading when you just type a wrong password
      if (!error.config.url.includes('/login')) {
        localStorage.removeItem('userInfo');
        window.location.href = '/'; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;