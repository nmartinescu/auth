/**
 * Utility functions for authentication
 */

/**
 * Check if user is currently authenticated
 * @returns boolean indicating if user is logged in
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('user');
  
  if (!token || !userData) {
    return false;
  }
  
  try {
    // Validate that user data is valid JSON
    JSON.parse(userData);
    return true;
  } catch (error) {
    // Invalid user data, clean up
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return false;
  }
};

/**
 * Get current user data from localStorage
 * @returns user object or null if not authenticated
 */
export const getCurrentUser = () => {
  if (!isAuthenticated()) {
    return null;
  }
  
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Get authentication token
 * @returns token string or null
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Clear authentication data (logout)
 */
export const clearAuth = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};
