import { API_BASE_URL } from "@/lib/config/constants"
import { tokenService } from "./token-service"

interface TestResultsQuery {
  limit?: number
  sortBy?: string
  order?: "asc" | "desc"
}

interface TestStatistics {
  totalTests: number
  averageScore: number
  highestScore: number
  lowestScore: number
  correctAnswers: number
  totalQuestions: number
  averagePercentage: number
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await tokenService.getValidAccessToken()
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  }
}

export const testResultsService = {
  async getTestResults(query?: TestResultsQuery): Promise<any[]> {
    try {
      const params = new URLSearchParams()
      if (query?.limit) params.append("limit", query.limit.toString())
      if (query?.sortBy) params.append("sortBy", query.sortBy)
      if (query?.order) params.append("order", query.order)

      const headers = await getAuthHeaders()

      const response = await fetch(`${API_BASE_URL}/api/test-results?${params.toString()}`, {
        headers,
      })

      if (!response.ok) {
        console.error("Failed to fetch test results:", response.status)
        if (response.status === 401) {
          tokenService.logout()
        }
        return []
      }

      const data = await response.json()
      return data.data || data || []
    } catch (error) {
      console.error("Error fetching test results:", error)
      return []
    }
  },

  async getTestStatistics(): Promise<TestStatistics | null> {
    try {
      const headers = await getAuthHeaders()

      const response = await fetch(`${API_BASE_URL}/api/test-results/stats/summary`, {
        headers,
      })

      if (!response.ok) {
        console.error("Failed to fetch test statistics:", response.status)
        if (response.status === 401) {
          tokenService.logout()
        }
        return null
      }

      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("Error fetching test statistics:", error)
      return null
    }
  },

  async saveTestResult(testResult: any): Promise<any> {
    try {
      const headers = await getAuthHeaders()

      const response = await fetch(`${API_BASE_URL}/api/test-results`, {
        method: "POST",
        headers,
        body: JSON.stringify(testResult),
      })

      if (!response.ok) {
        console.error("Failed to save test result:", response.status)
        if (response.status === 401) {
          tokenService.logout()
        }
        return null
      }

      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error("Error saving test result:", error)
      return null
    }
  },

  async deleteTestResult(id: string): Promise<void> {
    try {
      const headers = await getAuthHeaders()

      const response = await fetch(`${API_BASE_URL}/api/test-results/${id}`, {
        method: "DELETE",
        headers,
      })

      if (!response.ok && response.status === 401) {
        tokenService.logout()
      }
    } catch (error) {
      console.error("Error deleting test result:", error)
    }
  },
}
