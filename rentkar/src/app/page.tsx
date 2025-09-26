"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Truck, Shield, Users, MapPin } from "lucide-react"
import axios, { AxiosError } from "axios"
import Cookies from "js-cookie"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [inputs, setInputs] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState<{ email?: string; password?: string; server?: string }>({})
  const [activeTab, setActiveTab] = useState("admin")

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000"

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setErrors({})
    setInputs({ email: "", password: "" })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: "", server: "" })
  }

  const validateForm = () => {
    const newErrors: typeof errors = {}
    if (!inputs.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(inputs.email)) {
      newErrors.email = "Enter a valid email"
    }
    if (!inputs.password) {
      newErrors.password = "Password is required"
    } else if (inputs.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent, userType: "admin" | "partner") => {
    e.preventDefault()
    if (!validateForm()) return

    setErrors({})
    setIsLoading(true)

    try {
      if (userType === "admin") {
        if (inputs.email === "admin@rentkar.com" && inputs.password === "admin123") {
          Cookies.set("adminToken", "demo-admin-token", {
            secure: true,
            sameSite: "None",
            expires: 3,
          })
          window.location.href = "/admin"
        } else {
          setErrors({ server: "Invalid admin credentials" })
        }
      } else {
        const { status, data } = await axios.post(`${appUrl}/api/partners/auth`, inputs)

        if (status === 200 || status === 201) {
          Cookies.set("token", data?.token, {
            secure: true,
            sameSite: "None",
            expires: 3,
          })
          window.location.href = `/partner?detailsFilled=${data?.detailsFilled}`
        }
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error(error.response?.data?.message || error.message);
        setErrors({ server: error.response?.data?.message || "Invalid email or password" });
      } else {
        console.error(error);
        setErrors({ server: "An unexpected error occurred" });
      }
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center glow-primary">
                <Truck className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Rentkar</h1>
                <p className="text-muted-foreground">Delivery Management</p>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-balance leading-tight">
              Streamline Your <span className="text-primary">Delivery Operations</span>
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Manage orders, assign delivery partners, and track deliveries with real-time map visualization.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-card border">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Secure</p>
                <p className="text-xs text-muted-foreground">Role-based access</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-card border">
              <Users className="w-5 h-5 text-accent" />
              <div>
                <p className="font-medium text-sm">Efficient</p>
                <p className="text-xs text-muted-foreground">Partner management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-card border">
              <MapPin className="w-5 h-5 text-chart-3" />
              <div>
                <p className="font-medium text-sm">Real-time</p>
                <p className="text-xs text-muted-foreground">Map tracking</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
            <CardDescription>Choose your role to access the delivery management system</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="admin" className="cursor-pointer">Admin</TabsTrigger>
                <TabsTrigger value="partner" className="cursor-pointer">Delivery Partner</TabsTrigger>
              </TabsList>

              <TabsContent value="admin" className="space-y-4 mt-6">
                <form onSubmit={(e) => handleLogin(e, "admin")} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      name="email"
                      type="email"
                      value={inputs.email}
                      placeholder="admin@rentkar.com"
                      onChange={handleChange}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      name="password"
                      type="password"
                      value={inputs.password}
                      placeholder="Enter your password"
                      onChange={handleChange}
                    />
                    {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                  </div>
                  {errors.server && <p className="text-sm text-red-500 text-center">{errors.server}</p>}
                  <Button type="submit" className="w-full glow-primary" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in as Admin"}
                  </Button>
                </form>
                <div className="text-xs text-muted-foreground text-center">
                  Demo credentials: admin@rentkar.com / admin123
                </div>
              </TabsContent>

              <TabsContent value="partner" className="space-y-4 mt-6">
                <form onSubmit={(e) => handleLogin(e, "partner")} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="partner-email">Email</Label>
                    <Input
                      id="partner-email"
                      type="email"
                      name="email"
                      value={inputs.email}
                      placeholder="partner@example.com"
                      onChange={handleChange}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partner-password">Password</Label>
                    <Input
                      id="partner-password"
                      type="password"
                      name="password"
                      value={inputs.password}
                      placeholder="Enter your password"
                      onChange={handleChange}
                    />
                    {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                  </div>
                  {errors.server && <p className="text-sm text-red-500 text-center">{errors.server}</p>}
                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground glow-accent"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign in as Partner"}
                  </Button>
                </form>
                <div className="text-xs text-muted-foreground text-center">
                  Demo credentials: partner@example.com / partner123
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
