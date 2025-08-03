// Environment-based API Configuration
const getApiBaseUrl = () => {
    // Development: when running locally (npm run dev)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000';
    }

    return 'https://ostep-web.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();

// API Endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/api/auth/login`,
        REGISTER: `${API_BASE_URL}/api/auth/register`,
        FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/password/forgot`,
        RESET_PASSWORD: `${API_BASE_URL}/api/auth/password/reset`,
        DELETE_ACCOUNT: `${API_BASE_URL}/api/auth/account/delete`,
    }
} as const;

// Environment info for debugging
export const ENV_INFO = {
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
    origin: typeof window !== 'undefined' ? window.location.origin : 'unknown',
    apiBaseUrl: API_BASE_URL,
    isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
} as const;