// Environment-based API Configuration
const getApiBaseUrl = () => {
    // Development: when running locally (npm run dev)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000';
    }

    return 'https://ostep-web.onrender.com';
};

const getTestServiceUrl = () => {
    // Development: when running locally (npm run dev)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5004';
    }

    // Production: update with your Test service URL
    return 'https://test-service.onrender.com'; // Update this when deployed
};

export const API_BASE_URL = getApiBaseUrl();
export const TEST_SERVICE_URL = getTestServiceUrl();

// API Endpoints - All algorithm services now route through main-service
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
        SIMULATE: `${API_BASE_URL}/api/cpu-scheduling`,
        TEST: {
            GENERATE: `${API_BASE_URL}/api/cpu-scheduling/test/generate`,
            GENERATE_MULTIPLE: `${API_BASE_URL}/api/cpu-scheduling/test/generate-multiple`,
        }
    },
    DISK: {
        SIMULATE: `${API_BASE_URL}/api/disk-scheduling`,
        TEST: {
            GENERATE: `${API_BASE_URL}/api/disk-scheduling/test/generate`,
            GENERATE_MULTIPLE: `${API_BASE_URL}/api/disk-scheduling/test/generate-multiple`,
        }
    },
    MEMORY: {
        SIMULATE: `${API_BASE_URL}/api/memory-management`,
        TEST: {
            GENERATE: `${API_BASE_URL}/api/memory-management/test/generate`,
            GENERATE_MULTIPLE: `${API_BASE_URL}/api/memory-management/test/generate-multiple`,
        }
    },
    TEST_GENERATION: {
        GENERATE: `${TEST_SERVICE_URL}/api/test-generation/generate`,
        GENERATE_BY_TYPE: `${TEST_SERVICE_URL}/api/test-generation/generate-by-type`,
        CUSTOM: `${TEST_SERVICE_URL}/api/test-generation/custom`,
        CHECK: `${TEST_SERVICE_URL}/api/test-generation/check`,
    },
    SIMULATIONS: {
        SAVE: `${API_BASE_URL}/api/simulations`,
        GET_ALL: `${API_BASE_URL}/api/simulations`,
        GET_BY_ID: `${API_BASE_URL}/api/simulations`,
        DELETE: `${API_BASE_URL}/api/simulations`,
    },
    TEST_RESULTS: {
        SAVE: `${API_BASE_URL}/api/test-results`,
        GET_ALL: `${API_BASE_URL}/api/test-results`,
        GET_BY_ID: `${API_BASE_URL}/api/test-results`,
    }
} as const;

// Environment info for debugging
export const ENV_INFO = {
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
    origin: typeof window !== 'undefined' ? window.location.origin : 'unknown',
    apiBaseUrl: API_BASE_URL,
    testServiceUrl: TEST_SERVICE_URL,
    isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
} as const;