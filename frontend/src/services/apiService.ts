import { tokenService } from './tokenService';

interface ApiOptions extends RequestInit {
    requiresAuth?: boolean;
}

class ApiService {
    async request(url: string, options: ApiOptions = {}): Promise<Response> {
        const { requiresAuth = false, ...fetchOptions } = options;

        // If authentication is required, get a valid access token
        if (requiresAuth) {
            const accessToken = await tokenService.getValidAccessToken();
            
            if (!accessToken) {
                // Token refresh failed, redirect to login
                tokenService.logout();
                throw new Error('Authentication required');
            }

            // Add authorization header
            fetchOptions.headers = {
                ...fetchOptions.headers,
                'Authorization': `Bearer ${accessToken}`,
            };
        }

        // Make the API call
        const response = await fetch(url, fetchOptions);

        // Handle token expiration
        if (response.status === 401 && requiresAuth) {
            const data = await response.json().catch(() => ({}));
            
            if (data.code === 'TOKEN_EXPIRED') {
                // Try to refresh token and retry the request
                const newAccessToken = await tokenService.refreshAccessToken();
                
                if (newAccessToken) {
                    // Retry the request with new token
                    fetchOptions.headers = {
                        ...fetchOptions.headers,
                        'Authorization': `Bearer ${newAccessToken.accessToken}`,
                    };
                    return fetch(url, fetchOptions);
                } else {
                    // Refresh failed, redirect to login
                    tokenService.logout();
                    throw new Error('Authentication expired');
                }
            }
        }

        return response;
    }

    // Convenience methods
    async get(url: string, requiresAuth = false): Promise<Response> {
        return this.request(url, { method: 'GET', requiresAuth });
    }

    async post(url: string, data: any, requiresAuth = false): Promise<Response> {
        return this.request(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            requiresAuth,
        });
    }

    async put(url: string, data: any, requiresAuth = false): Promise<Response> {
        return this.request(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            requiresAuth,
        });
    }

    async delete(url: string, data?: any, requiresAuth = false): Promise<Response> {
        const options: ApiOptions = {
            method: 'DELETE',
            requiresAuth,
        };

        if (data) {
            options.headers = { 'Content-Type': 'application/json' };
            options.body = JSON.stringify(data);
        }

        return this.request(url, options);
    }
}

export const apiService = new ApiService();