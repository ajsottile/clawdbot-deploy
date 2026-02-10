"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/store/auth-store"
import { 
  User, 
  CreditCard, 
  Bell, 
  Shield, 
  Key,
  Check,
} from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Manage your account and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <User className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your personal information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} isLoading={isSaving}>
                {saved && <Check className="mr-2 h-4 w-4" />}
                {saved ? "Saved!" : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <CreditCard className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <CardTitle>Billing</CardTitle>
                <CardDescription>Manage your subscription and payment</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-[hsl(var(--muted))] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Pro Plan</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    $30.37/month • Renews Feb 10, 2026
                  </p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button variant="outline">Change Plan</Button>
              <Button variant="outline">Update Payment</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <Bell className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure how you receive updates</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Deployment status updates", enabled: true },
              { label: "Security alerts", enabled: true },
              { label: "Product updates", enabled: false },
              { label: "Marketing emails", enabled: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm">{item.label}</span>
                <button
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    item.enabled ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--muted))]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      item.enabled ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <Shield className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Protect your account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-[hsl(var(--muted))] p-4">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                <div>
                  <p className="font-medium">Two-factor authentication</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Add an extra layer of security
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
            <Button variant="outline" className="text-[hsl(var(--destructive))]">
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-[hsl(var(--destructive))]/30">
          <CardHeader>
            <CardTitle className="text-[hsl(var(--destructive))]">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant="destructive">Delete</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
