import apiClient from "@/lib/api-client"

export interface Simulation {
  id?: string
  name: string
  type: "process" | "memory" | "disk"
  data: any
  createdAt?: string
  updatedAt?: string
}

export const simulationService = {
  async getSimulations(): Promise<Simulation[]> {
    const response = await apiClient.get("/api/simulations")
    return response.data.data || response.data
  },

  async getSimulationById(id: string): Promise<Simulation> {
    const response = await apiClient.get(`/api/simulations/${id}`)
    return response.data.data || response.data
  },

  async createSimulation(simulation: Omit<Simulation, "id" | "createdAt" | "updatedAt">): Promise<Simulation> {
    const response = await apiClient.post("/api/simulations", simulation)
    return response.data.data || response.data
  },

  async deleteSimulation(id: string): Promise<void> {
    await apiClient.delete(`/api/simulations/${id}`)
  },
}
