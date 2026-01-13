"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Mail, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { API_ENDPOINTS } from "@/lib/config/constants"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const userData = localStorage.getItem("user")
    if (token && userData) {
      window.location.href = "/dashboard"
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSubmitted(true)
      } else {
        setError(data.message || "Failed to send reset email")
      }
    } catch (error) {
      console.error("Forgot password error:", error)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>We've sent password reset instructions to your email</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="p-4 bg-green-500/10 rounded-lg text-center">
              <p className="font-semibold text-foreground mb-2">Email Sent Successfully!</p>
              <p className="text-sm text-muted-foreground">
                If an account with <strong>{email}</strong> exists, you'll receive a password reset link shortly.
              </p>
            </div>

            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="font-semibold text-sm text-primary mb-2">Next Steps:</p>
              <ul className="text-sm text-primary space-y-1">
                <li>• Check your email inbox</li>
                <li>• Look in your spam/junk folder</li>
                <li>• Click the reset link within 1 hour</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
            <p>
              Remember your password?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Back to login
              </Link>
            </p>
            <p className="text-xs">Didn't receive an email? Try checking your spam folder or contact support</p>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive reset instructions</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reset Link
                </>
              )}
            </Button>
          </CardContent>
        </form>

        <CardFooter className="text-center text-sm text-muted-foreground">
          <p className="w-full">
            Remember your password?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
