// Environment-based API Configuration
const getApiBaseUrl = () => {
    // Development: when running locally (npm run dev)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000';
    }

    return 'https://ostep-web.onrender.com';
};

const getCpuServiceUrl = () => {
    // Development: when running locally (npm run dev)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5001';
    }

    // Production: update with your CPU service URL
    return 'https://cpu-service.onrender.com'; // Update this when deployed
};

export const API_BASE_URL = getApiBaseUrl();
export const CPU_SERVICE_URL = getCpuServiceUrl();

// API Endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/api/auth/login`,
        REGISTER: `${API_BASE_URL}/api/auth/register`,
        FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/password/forgot`,
        RESET_PASSWORD: `${API_BASE_URL}/api/auth/password/reset`,
        DELETE_ACCOUNT: `${API_BASE_URL}/api/auth/account/delete`,
        REFRESH: `${API_BASE_URL}/api/auth/refresh`,
    },
    CPU: {
        SIMULATE: `${CPU_SERVICE_URL}/api/cpu`,
    }
} as const;

// Environment info for debugging
export const ENV_INFO = {
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
    origin: typeof window !== 'undefined' ? window.location.origin : 'unknown',
    apiBaseUrl: API_BASE_URL,
    isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
} as const;