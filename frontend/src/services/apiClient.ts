import axios from 'axios';

// Get token from local storage
const getToken = () => {
  return localStorage.getItem('token');
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
      console.log("📋 Added Authorization header to request");
    }
    
    console.log("🌐 Making request to:", config.url, "with method:", config.method);
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
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
      // Could redirect to login page or refresh token
      console.error('Session expired or unauthorized');
      // Remove token if it's invalid
      localStorage.removeItem('token');
    }
    
    return Promise.reject(error);
  }
);
