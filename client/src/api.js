import axios from 'axios';

// 1. Create the Axios Instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Make sure this matches your backend
});

// 2. The "Request Interceptor"
// This runs BEFORE every request is sent.
api.interceptors.request.use(
  (config) => {
    // Check if user info exists in storage
    const userInfo = localStorage.getItem('userInfo');

    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      
      // Attach the token to the header
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. The "Response Interceptor" (Optional but recommended)
// If the token is expired (401 error), force logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid/expired -> Clear storage & redirect
      localStorage.removeItem('userInfo');
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export default api;