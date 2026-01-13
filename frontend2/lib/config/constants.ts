export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
export const TEST_SERVICE_URL = process.env.NEXT_PUBLIC_TEST_SERVICE_URL || "http://localhost:3000"

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
    DELETE_ACCOUNT: `${API_BASE_URL}/api/auth/delete-account`,
    REFRESH_TOKEN: `${API_BASE_URL}/api/auth/refresh-token`,
  },
  SIMULATIONS: {
    BASE: `${API_BASE_URL}/api/simulations`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/api/simulations/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/simulations/${id}`,
  },
  TEST_RESULTS: {
    BASE: `${TEST_SERVICE_URL}/api/test-results`,
    GET_BY_ID: (id: string) => `${TEST_SERVICE_URL}/api/test-results/${id}`,
    DELETE: (id: string) => `${TEST_SERVICE_URL}/api/test-results/${id}`,
    STATISTICS: `${TEST_SERVICE_URL}/api/test-results/statistics`,
  },
}
