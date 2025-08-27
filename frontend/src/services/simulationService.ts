import { apiClient } from './apiClient';

export interface Simulation {
  _id?: string;
  userId?: string;
  name: string;
  type: string;
  data: any;
  createdAt?: string;
  updatedAt?: string;
}

export const simulationService = {
  /**
   * Save a simulation to the user's account
   * @param name Simulation name
   * @param type Simulation type (e.g., 'process', 'memory', 'disk')
   * @param data Simulation data
   * @returns Promise with the created simulation
   */
  saveSimulation: async (name: string, type: string, data: any): Promise<Simulation> => {
    console.log("🚀 simulationService.saveSimulation called with:", { name, type, data });
    
    const payload = { name, type, data };
    console.log("📤 Sending POST request to /api/simulations with payload:", payload);
    
    try {
      const response = await apiClient.post('/api/simulations', payload);
      console.log("📥 Response received:", response);
      return response.data;
    } catch (error) {
      console.error("💥 Error in simulationService.saveSimulation:", error);
      throw error;
    }
  },

  /**
   * Get all simulations for the current user
   * @returns Promise with an array of simulations
   */
  getSimulations: async (): Promise<Simulation[]> => {
    const response = await apiClient.get('/api/simulations');
    return response.data;
  },

  /**
   * Get a specific simulation by ID
   * @param id Simulation ID
   * @returns Promise with the simulation data
   */
  getSimulationById: async (id: string): Promise<Simulation> => {
    const response = await apiClient.get(`/api/simulations/${id}`);
    return response.data;
  },

  /**
   * Delete a simulation
   * @param id Simulation ID
   * @returns Promise with the deletion result
   */
  deleteSimulation: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/simulations/${id}`);
  }
};
