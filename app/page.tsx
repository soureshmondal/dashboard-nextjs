"use client"

import { useState, useEffect } from "react"
import { Provider } from "react-redux"
import { store } from "@/store/store"
import Dashboard from "@/components/dashboard/dashboard"
import AuthWrapper from "@/components/auth/auth-wrapper"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <Provider store={store}>
        <AuthWrapper>
          <Dashboard />
        </AuthWrapper>
        <Toaster />
      </Provider>
    </ThemeProvider>
  )
}
