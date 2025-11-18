import axios from 'axios';

const getToken = () => {
  return localStorage.getItem('authToken'); // Changed from 'token' to 'authToken'
};

export const apiClient = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    console.log("Token from localStorage:", token ? "Token found" : "No token");
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Added Authorization header to request");
    }
    
    console.log("Making request to:", config.url, "with method:", config.method);
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // handle session expiry or unauthorized
    if (error.response?.status === 401) {
      console.error('Session expired or unauthorized');
      // remove invalid token
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        console.log('Redirecting to login due to expired token...');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);
