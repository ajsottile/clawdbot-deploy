"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Cloud, Github, Mail, Check } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"

const benefits = [
  "5-minute deployment",
  "Full data ownership",
  "24/7 support",
  "Cancel anytime",
]

export default function SignupPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Mock successful signup
      setUser({
        id: `user-${Date.now()}`,
        email,
        name,
        createdAt: new Date().toISOString(),
      })
      
      router.push("/dashboard")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-4xl gap-8 lg:grid-cols-2">
        {/* Left side - Benefits */}
        <div className="hidden flex-col justify-center lg:flex">
          <h2 className="text-3xl font-bold">
            Start deploying your AI assistant today
          </h2>
          <p className="mt-4 text-[hsl(var(--muted-foreground))]">
            Join thousands of users who run their personal AI with ClawBot Deploy.
          </p>
          <ul className="mt-8 space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10">
                  <Check className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                </div>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right side - Form */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
              <Cloud className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>
              Get started with a free 7-day trial
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
                type="text"
                label="Name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              
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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                By signing up, you agree to our{" "}
                <Link href="/terms" className="text-[hsl(var(--primary))] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[hsl(var(--primary))] hover:underline">
                  Privacy Policy
                </Link>
              </p>
              
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Create account
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
              Already have an account?{" "}
              <Link href="/login" className="text-[hsl(var(--primary))] hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
