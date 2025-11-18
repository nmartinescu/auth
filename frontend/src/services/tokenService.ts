import { API_ENDPOINTS } from '../config/constants';

interface TokenData {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    expiresAt: number;
}

class TokenService {
    private refreshPromise: Promise<TokenData | null> | null = null;

    // store tokens in localStorage
    setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
        const expiresAt = Date.now() + expiresIn;
        const tokenData: TokenData = {
            accessToken,
            refreshToken,
            expiresIn,
            expiresAt
        };
        localStorage.setItem('tokenData', JSON.stringify(tokenData));
    }

    // get stored tokens
    getTokens(): TokenData | null {
        const tokenData = localStorage.getItem('tokenData');
        if (!tokenData) return null;
        
        try {
            return JSON.parse(tokenData);
        } catch {
            return null;
        }
    }

    // get access token (legacy support)
    getAccessToken(): string | null {
        const tokens = this.getTokens();
        return tokens?.accessToken || localStorage.getItem('authToken');
    }

    // get refresh token
    getRefreshToken(): string | null {
        const tokens = this.getTokens();
        return tokens?.refreshToken || null;
    }

    // check if access token is expired or will expire soon (within 2 minutes)
    isTokenExpired(): boolean {
        const tokens = this.getTokens();
        if (!tokens) return true;
        
        const bufferTime = 2 * 60 * 1000; // 2 minutes buffer
        return Date.now() >= (tokens.expiresAt - bufferTime);
    }

    // refresh access token
    async refreshAccessToken(): Promise<TokenData | null> {
    
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            this.clearTokens();
            return null;
        }

        this.refreshPromise = this.performRefresh(refreshToken);
        
        try {
            const result = await this.refreshPromise;
            return result;
        } finally {
            this.refreshPromise = null;
        }
    }

    private async performRefresh(refreshToken: string): Promise<TokenData | null> {
        try {
            const response = await fetch(API_ENDPOINTS.AUTH.REFRESH, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });

            const data = await response.json();

            if (data.success) {
                const { accessToken, refreshToken: newRefreshToken, expiresIn } = data.data;
                this.setTokens(accessToken, newRefreshToken, expiresIn);
                
                // update legacy token storage for backward compatibility
                localStorage.setItem('authToken', accessToken);
                localStorage.setItem('user', JSON.stringify(data.data.user));
                
                return this.getTokens();
            } else {
                this.clearTokens();
                return null;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.clearTokens();
            return null;
        }
    }

    // get valid access token (refresh if needed)
    async getValidAccessToken(): Promise<string | null> {
        if (!this.isTokenExpired()) {
            return this.getAccessToken();
        }

        const refreshedTokens = await this.refreshAccessToken();
        return refreshedTokens?.accessToken || null;
    }

    // clear all tokens
    clearTokens(): void {
        localStorage.removeItem('tokenData');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    }

    // check if user is authenticated
    isAuthenticated(): boolean {
        const tokens = this.getTokens();
        return !!(tokens?.accessToken && tokens?.refreshToken);
    }

    // logout user
    logout(): void {
        this.clearTokens();
        window.location.href = '/login';
    }
}

export const tokenService = new TokenService();