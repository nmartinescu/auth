import axios from 'axios';

// Get token from local storage
const getToken = () => {
  return localStorage.getItem('authToken'); // Changed from 'token' to 'authToken'
};

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    console.log("🔑 Token from localStorage:", token ? "Token found" : "No token");
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Added Authorization header to request");
    }
    
    console.log("🌐 Making request to:", config.url, "with method:", config.method);
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle session expiry or unauthorized
    if (error.response?.status === 401) {
      console.error('Session expired or unauthorized');
      // Remove invalid token
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        console.log('Redirecting to login due to expired token...');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);
