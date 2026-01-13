interface TokenResponse {
  accessToken: string
  refreshToken?: string
}

class TokenService {
  private readonly ACCESS_TOKEN_KEY = "authToken"
  private readonly REFRESH_TOKEN_KEY = "refreshToken"
  private readonly USER_KEY = "user"

  getAccessToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  setTokens(accessToken: string, refreshToken?: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken)
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
    }
  }

  async getValidAccessToken(): Promise<string | null> {
    const accessToken = this.getAccessToken()
    if (!accessToken) return null

    // For now, just return the token - you can add JWT expiry checking here
    return accessToken
  }

  async refreshAccessToken(): Promise<TokenResponse | null> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) return null

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) return null

      const data = await response.json()
      this.setTokens(data.accessToken, data.refreshToken)
      return data
    } catch {
      return null
    }
  }

  logout(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)
    window.location.href = "/login"
  }
}

export const tokenService = new TokenService()
