"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { API_ENDPOINTS } from "@/lib/config/constants"
import type { User } from "@/types/user"

export default function DeleteAccountPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmText, setConfirmText] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      window.location.href = "/login"
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    } catch (error) {
      console.error("Error parsing user data:", error)
      window.location.href = "/login"
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!password) {
      setError("Password is required to delete your account")
      return
    }

    if (confirmText !== "DELETE MY ACCOUNT") {
      setError("Please type 'DELETE MY ACCOUNT' exactly as shown")
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(API_ENDPOINTS.AUTH.DELETE_ACCOUNT, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password, confirmDeletion: confirmText }),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.removeItem("authToken")
        localStorage.removeItem("user")
        localStorage.removeItem("tokenData")
        alert("Your account has been permanently deleted. You will be redirected to the home page.")
        window.location.href = "/"
      } else {
        setError(data.message || "Failed to delete account")
      }
    } catch (error) {
      console.error("Account deletion error:", error)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <Trash2 className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Delete Account</CardTitle>
          <CardDescription>Permanently delete your OS Sim account</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Warning Section */}
          <div className="p-4 bg-destructive/10 border-2 border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="font-bold text-destructive">Warning: This action cannot be undone</span>
            </div>
            <ul className="text-sm text-destructive space-y-1">
              <li>• Your account will be permanently deleted</li>
              <li>• All your data will be removed from our servers</li>
              <li>• You will lose access to all OS Sim features</li>
              <li>• This action is irreversible</li>
            </ul>
          </div>

          {/* User Info */}
          <div className="p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground mb-1">Account to be deleted:</p>
            <p className="font-semibold">
              {user.name} ({user.email})
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-destructive/50 focus-visible:ring-destructive"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmText">Type 'DELETE MY ACCOUNT' to confirm</Label>
              <Input
                id="confirmText"
                type="text"
                placeholder="DELETE MY ACCOUNT"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                required
                className="border-destructive/50 focus-visible:ring-destructive"
              />
              <p className="text-xs text-destructive">Type exactly: DELETE MY ACCOUNT</p>
            </div>

            <Button
              type="submit"
              variant="destructive"
              className="w-full"
              disabled={isLoading || !password || confirmText !== "DELETE MY ACCOUNT"}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting Account...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete My Account Permanently
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => router.push("/dashboard")}
            >
              Cancel - Keep My Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
