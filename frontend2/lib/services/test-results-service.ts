import { TEST_SERVICE_URL } from "@/lib/config/constants"

interface TestResultsQuery {
  limit?: number
  sortBy?: string
  order?: "asc" | "desc"
}

interface TestStatistics {
  totalTests: number
  averageScore: number
  highestScore: number
  correctAnswers: number
  totalQuestions: number
}

export const testResultsService = {
  async getTestResults(query?: TestResultsQuery): Promise<any[]> {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    const params = new URLSearchParams()
    if (query?.limit) params.append("limit", query.limit.toString())
    if (query?.sortBy) params.append("sortBy", query.sortBy)
    if (query?.order) params.append("order", query.order)

    const response = await fetch(`${TEST_SERVICE_URL}/api/test-results?${params.toString()}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
    const data = await response.json()
    return data.data || data
  },

  async getTestStatistics(): Promise<TestStatistics> {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    const response = await fetch(`${TEST_SERVICE_URL}/api/test-results/statistics`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
    const data = await response.json()
    return data.data || data
  },

  async deleteTestResult(id: string): Promise<void> {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    await fetch(`${TEST_SERVICE_URL}/api/test-results/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
  },
}
