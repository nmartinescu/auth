"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Cpu, HardDrive, MemoryStick, FileText, LayoutDashboard, LogIn, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { tokenService } from "@/lib/services/token-service"

const navItems = [
  { href: "/process", label: "Process", icon: Cpu },
  { href: "/memory", label: "Memory", icon: MemoryStick },
  { href: "/disk", label: "Disk", icon: HardDrive },
  { href: "/test", label: "Test", icon: FileText },
]

const loggedInNavItems = [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }, ...navItems]

export function Navbar() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const userData = localStorage.getItem("user")
    setIsLoggedIn(!!(token && userData))
  }, [])

  const handleLogout = () => {
    tokenService.clearTokens()
    setIsLoggedIn(false)
    window.location.href = "/login"
  }

  const items = isLoggedIn ? loggedInNavItems : navItems

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80"
        >
          OS Sim
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "gap-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                    isActive && "bg-secondary text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}

          {/* Auth Button */}
          {isLoggedIn ? (
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="gap-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          ) : (
            <Link href="/login">
              <Button
                variant="ghost"
                className="gap-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                      isActive && "bg-secondary text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}

            {isLoggedIn ? (
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start gap-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
