import type React from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"

import { Analytics } from "@vercel/analytics/next"
import { Navbar } from "@/components/navbar"
import { ThemeToggle } from "@/components/theme-toggle"
import "./globals.css"
import { Inter, Geist_Mono } from "next/font/google"

const _inter = Inter({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OS Simulator - Interactive Learning Platform",
  description:
    "Interactive learning platform for understanding core operating system concepts through hands-on simulations and visualizations.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Navbar />
          {children}
          <ThemeToggle />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
