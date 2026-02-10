"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Cloud, 
  Server, 
  Globe, 
  ExternalLink,
  MoreVertical,
  Play,
  Square,
  Trash2,
  RefreshCw,
  Activity,
} from "lucide-react"
import { useDeploymentStore, type Deployment, type DeploymentStatus } from "@/store/deployment-store"
import { formatDate } from "@/lib/utils"

const statusConfig: Record<DeploymentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" }> = {
  pending: { label: "Pending", variant: "secondary" },
  provisioning: { label: "Provisioning", variant: "warning" },
  configuring: { label: "Configuring", variant: "warning" },
  installing: { label: "Installing", variant: "warning" },
  running: { label: "Running", variant: "success" },
  stopped: { label: "Stopped", variant: "secondary" },
  failed: { label: "Failed", variant: "destructive" },
}

// Mock data for demo
const mockDeployments: Deployment[] = [
  {
    id: "deploy-abc123",
    name: "Production Assistant",
    status: "running",
    region: "eastus",
    vmSize: "Standard_B2ms",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    ipAddress: "20.231.45.123",
    dashboardUrl: "https://openclaw-abc123.azurewebsites.net",
    cost: 45.60,
  },
  {
    id: "deploy-def456",
    name: "Dev Testing",
    status: "stopped",
    region: "westeurope",
    vmSize: "Standard_B1s",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    ipAddress: "52.178.90.67",
    cost: 12.30,
  },
]

function DeploymentCard({ deployment }: { deployment: Deployment }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { updateDeployment, removeDeployment } = useDeploymentStore()
  const status = statusConfig[deployment.status]

  return (
    <Card className="group transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
              <Cloud className="h-5 w-5 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <h3 className="font-semibold">{deployment.name}</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {deployment.id}
              </p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-1.5 opacity-0 transition-opacity hover:bg-[hsl(var(--muted))] group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-20 w-48 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1 shadow-lg">
                  {deployment.status === "running" ? (
                    <button
                      onClick={() => {
                        updateDeployment(deployment.id, { status: "stopped" })
                        setMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-[hsl(var(--muted))]"
                    >
                      <Square className="h-4 w-4" />
                      Stop
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        updateDeployment(deployment.id, { status: "running" })
                        setMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-[hsl(var(--muted))]"
                    >
                      <Play className="h-4 w-4" />
                      Start
                    </button>
                  )}
                  <button
                    onClick={() => {
                      updateDeployment(deployment.id, { status: "configuring" })
                      setTimeout(() => {
                        updateDeployment(deployment.id, { status: "running" })
                      }, 3000)
                      setMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-[hsl(var(--muted))]"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Restart
                  </button>
                  <hr className="my-1 border-[hsl(var(--border))]" />
                  <button
                    onClick={() => {
                      removeDeployment(deployment.id)
                      setMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Badge variant={status.variant}>{status.label}</Badge>
          <span className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
            <Globe className="h-3.5 w-3.5" />
            {deployment.region}
          </span>
          <span className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
            <Server className="h-3.5 w-3.5" />
            {deployment.vmSize.replace("Standard_", "")}
          </span>
        </div>

        {deployment.ipAddress && (
          <div className="mt-4 rounded-lg bg-[hsl(var(--muted))] p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">IP Address</p>
                <p className="font-mono text-sm">{deployment.ipAddress}</p>
              </div>
              {deployment.dashboardUrl && (
                <a
                  href={deployment.dashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-[hsl(var(--primary))] hover:underline"
                >
                  Open Dashboard
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-sm text-[hsl(var(--muted-foreground))]">
          <span>Created {formatDate(deployment.createdAt)}</span>
          {deployment.cost && (
            <span className="font-medium text-[hsl(var(--foreground))]">
              ${deployment.cost.toFixed(2)}/mo
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { deployments, setDeployments } = useDeploymentStore()

  useEffect(() => {
    // Load mock data on mount
    if (deployments.length === 0) {
      setDeployments(mockDeployments)
    }
  }, [deployments.length, setDeployments])

  const runningCount = deployments.filter((d) => d.status === "running").length
  const totalCost = deployments.reduce((sum, d) => sum + (d.cost || 0), 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Manage your OpenClaw deployments
          </p>
        </div>
        <Link href="/deploy">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Deployment
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card className="cloudhack-card cloudhack-glow">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg cloudhack-gradient">
              <Cloud className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Total Deployments
              </p>
              <p className="text-2xl font-bold">{deployments.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cloudhack-card cloudhack-glow">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg cloudhack-gradient">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Running
              </p>
              <p className="text-2xl font-bold">{runningCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cloudhack-card cloudhack-glow">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg cloudhack-gradient">
              <Server className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Monthly Cost
              </p>
              <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deployments List */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Your Deployments</h2>
        {deployments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
                <Cloud className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No deployments yet</h3>
              <p className="mt-2 text-center text-[hsl(var(--muted-foreground))]">
                Create your first deployment to get started with your personal AI assistant.
              </p>
              <Link href="/deploy" className="mt-6">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Deployment
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {deployments.map((deployment) => (
              <DeploymentCard key={deployment.id} deployment={deployment} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
