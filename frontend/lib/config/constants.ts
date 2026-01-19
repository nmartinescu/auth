export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
export const TEST_SERVICE_URL = process.env.NEXT_PUBLIC_TEST_SERVICE_URL || "http://localhost:3004"

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
    },
  },
  DISK: {
    SIMULATE: `${API_BASE_URL}/api/disk-scheduling`,
    TEST: {
      GENERATE: `${API_BASE_URL}/api/disk-scheduling/test/generate`,
      GENERATE_MULTIPLE: `${API_BASE_URL}/api/disk-scheduling/test/generate-multiple`,
    },
  },
  MEMORY: {
    SIMULATE: `${API_BASE_URL}/api/memory-management`,
    TEST: {
      GENERATE: `${API_BASE_URL}/api/memory-management/test/generate`,
      GENERATE_MULTIPLE: `${API_BASE_URL}/api/memory-management/test/generate-multiple`,
    },
  },
  TEST_RESULTS: {
    SAVE: `${API_BASE_URL}/api/test-results`,
    GET_ALL: `${API_BASE_URL}/api/test-results`,
    GET_BY_ID: `${API_BASE_URL}/api/test-results`,
    GET_STATS: `${API_BASE_URL}/api/test-results/stats/summary`, // Fixed endpoint
    DELETE: `${API_BASE_URL}/api/test-results`,
  },
  TEST_GENERATION: {
    GENERATE: `${TEST_SERVICE_URL}/api/test-generation/generate`,
    GENERATE_BY_TYPE: `${TEST_SERVICE_URL}/api/test-generation/generate-by-type`,
    CUSTOM: `${TEST_SERVICE_URL}/api/test-generation/custom`,
    VERIFY: `${TEST_SERVICE_URL}/api/test-generation/verify`,
    DELETE_SESSION: `${TEST_SERVICE_URL}/api/test-generation/session`,
  },
  SIMULATIONS: {
    SAVE: `${API_BASE_URL}/api/simulations`,
    GET_ALL: `${API_BASE_URL}/api/simulations`,
    GET_BY_ID: `${API_BASE_URL}/api/simulations`,
    DELETE: `${API_BASE_URL}/api/simulations`,
  },
} as const
