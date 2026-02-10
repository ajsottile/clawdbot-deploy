"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Cloud, Github, Mail } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate auth - in production, this would call Supabase
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Mock successful login
      setUser({
        id: "user-1",
        email,
        name: email.split("@")[0],
        createdAt: new Date().toISOString(),
      })
      
      router.push("/dashboard")
    } catch {
      setError("Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Cloud className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-[hsl(var(--destructive))]/10 p-3 text-sm text-[hsl(var(--destructive))]">
                {error}
              </div>
            )}
            
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded border-[hsl(var(--border))]" />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-[hsl(var(--primary))] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign in
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[hsl(var(--border))]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[hsl(var(--card))] px-2 text-[hsl(var(--muted-foreground))]">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" type="button">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
            <Button variant="outline" type="button">
              <Mail className="mr-2 h-4 w-4" />
              Google
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[hsl(var(--primary))] hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
