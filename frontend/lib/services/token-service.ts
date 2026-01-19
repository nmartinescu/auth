import { API_ENDPOINTS } from "@/lib/config/constants"

interface TokenData {
  accessToken: string
  refreshToken: string
  expiresIn: number
  expiresAt: number
}

interface TokenResponse {
  accessToken: string
  refreshToken?: string
}

class TokenService {
  private refreshPromise: Promise<TokenData | null> | null = null
  private readonly ACCESS_TOKEN_KEY = "authToken"
  private readonly REFRESH_TOKEN_KEY = "refreshToken"
  private readonly USER_KEY = "user"
  private readonly TOKEN_DATA_KEY = "tokenData"

  setTokens(accessToken: string, refreshToken: string, expiresIn = 3600000): void {
    if (typeof window === "undefined") return

    const expiresAt = Date.now() + expiresIn
    const tokenData: TokenData = {
      accessToken,
      refreshToken,
      expiresIn,
      expiresAt,
    }
    localStorage.setItem(this.TOKEN_DATA_KEY, JSON.stringify(tokenData))
    // Also set legacy tokens for backward compatibility
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
  }

  getTokens(): TokenData | null {
    if (typeof window === "undefined") return null
    const tokenData = localStorage.getItem(this.TOKEN_DATA_KEY)
    if (!tokenData) return null

    try {
      return JSON.parse(tokenData)
    } catch {
      return null
    }
  }

  getAccessToken(): string | null {
    if (typeof window === "undefined") return null
    const tokens = this.getTokens()
    return tokens?.accessToken || localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null
    const tokens = this.getTokens()
    return tokens?.refreshToken || localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  isTokenExpired(): boolean {
    const tokens = this.getTokens()
    if (!tokens) return true

    const bufferTime = 2 * 60 * 1000 // 2 minutes buffer
    return Date.now() >= tokens.expiresAt - bufferTime
  }

  async refreshAccessToken(): Promise<TokenData | null> {
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      this.clearTokens()
      return null
    }

    this.refreshPromise = this.performRefresh(refreshToken)

    try {
      const result = await this.refreshPromise
      return result
    } finally {
      this.refreshPromise = null
    }
  }

  private async performRefresh(refreshToken: string): Promise<TokenData | null> {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.REFRESH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      })

      const data = await response.json()

      if (data.success) {
        const { accessToken, refreshToken: newRefreshToken, expiresIn } = data.data
        this.setTokens(accessToken, newRefreshToken, expiresIn)

        // Update legacy token storage for backward compatibility
        localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken)
        if (data.data.user) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(data.data.user))
        }

        return this.getTokens()
      } else {
        this.clearTokens()
        return null
      }
    } catch (error) {
      console.error("Token refresh failed:", error)
      this.clearTokens()
      return null
    }
  }

  async getValidAccessToken(): Promise<string | null> {
    if (!this.isTokenExpired()) {
      return this.getAccessToken()
    }

    const refreshedTokens = await this.refreshAccessToken()
    return refreshedTokens?.accessToken || null
  }

  clearTokens(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.TOKEN_DATA_KEY)
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)
  }

  isAuthenticated(): boolean {
    const tokens = this.getTokens()
    return !!(tokens?.accessToken && tokens?.refreshToken)
  }

  logout(): void {
    this.clearTokens()
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  }
}

export const tokenService = new TokenService()
