"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Cookies from "js-cookie"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "admin" | "partner"
}

interface AuthState {
  isAuthenticated: boolean
  role: "admin" | "partner" | null
  loading: boolean
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    loading: true,
  })

  const router = useRouter()
  const pathname = usePathname()

  const adminToken = Cookies.get("adminToken")
  const partnerToken = Cookies.get("token")

  useEffect(() => {
    const checkAuth = () => {
      let role: "admin" | "partner" | null = null

      if (pathname.startsWith("/admin")) {
        role = "admin"
        if (!adminToken) {
          router.replace("/")
          return
        }
      } else if (pathname.startsWith("/partner")) {
        role = "partner"
        if (!partnerToken) {
          router.replace("/")
          return
        }
      } else {
        router.replace("/")
        return
      }

      setAuthState({
        isAuthenticated: true,
        role,
        loading: false,
      })
    }

    checkAuth()
  }, [pathname, router, adminToken, partnerToken])

  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    )
  }

  if (!authState.isAuthenticated) return null

  if (requiredRole && authState.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
