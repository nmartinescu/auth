import axios from "axios"
import { API_BASE_URL, TEST_SERVICE_URL } from "./config/constants"

const getToken = () => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken")
}

// Helper function to determine the correct base URL
const getBaseURL = (url?: string) => {
  if (url?.includes("/api/test-generation")) {
    return TEST_SERVICE_URL
  }
  return API_BASE_URL
}

export const apiClient = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use(
  (config) => {
    // Set the baseURL dynamically based on the endpoint
    config.baseURL = getBaseURL(config.url)

    const token = getToken()

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    console.error("Request interceptor error:", error)
    return Promise.reject(error)
  },
)

apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // handle session expiry or unauthorized
    if (error.response?.status === 401) {
      console.error("Session expired or unauthorized")
      // remove invalid token
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken")
        localStorage.removeItem("user")

        // only redirect if we're not already on the login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login"
        }
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
