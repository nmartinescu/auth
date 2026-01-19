import { API_BASE_URL } from "@/lib/config/constants"
import { tokenService } from "./token-service"

export interface Simulation {
  id?: string
  name: string
  type: "process" | "memory" | "disk"
  data: any
  createdAt?: string
  updatedAt?: string
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await tokenService.getValidAccessToken()
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  }
}

export const simulationService = {
  async getSimulations(): Promise<Simulation[]> {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/api/simulations`, { headers })

      if (!response.ok) {
        if (response.status === 401) {
          tokenService.logout()
        }
        return []
      }

      const data = await response.json()
      return data.simulations || data.data || []
    } catch (error) {
      console.error("Error fetching simulations:", error)
      return []
    }
  },

  async getSimulationById(id: string): Promise<Simulation | null> {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/api/simulations/${id}`, { headers })

      if (!response.ok) {
        if (response.status === 401) {
          tokenService.logout()
        }
        return null
      }

      const data = await response.json()
      return data.simulation || data.data || data
    } catch (error) {
      console.error("Error fetching simulation:", error)
      return null
    }
  },

  async createSimulation(simulation: Omit<Simulation, "id" | "createdAt" | "updatedAt">): Promise<Simulation | null> {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/api/simulations`, {
        method: "POST",
        headers,
        body: JSON.stringify(simulation),
      })

      if (!response.ok) {
        if (response.status === 401) {
          tokenService.logout()
        }
        return null
      }

      const data = await response.json()
      return data.simulation || data.data || data
    } catch (error) {
      console.error("Error creating simulation:", error)
      return null
    }
  },

  async deleteSimulation(id: string): Promise<boolean> {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/api/simulations/${id}`, {
        method: "DELETE",
        headers,
      })

      if (!response.ok && response.status === 401) {
        tokenService.logout()
      }

      return response.ok
    } catch (error) {
      console.error("Error deleting simulation:", error)
      return false
    }
  },
}
