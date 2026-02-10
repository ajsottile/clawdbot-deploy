"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Cloud, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Loader2, 
  Server,
  Globe,
  DollarSign,
  Rocket,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { 
  useDeploymentStore, 
  AZURE_REGIONS, 
  VM_SIZES,
  type Deployment,
} from "@/store/deployment-store"
import { generateDeploymentId } from "@/lib/utils"
import { cn } from "@/lib/utils"

type Step = "configure" | "review" | "deploy"

const deploymentSteps = [
  { id: "provisioning", label: "Provisioning VM", duration: 3000 },
  { id: "configuring", label: "Configuring network", duration: 2000 },
  { id: "installing", label: "Installing OpenClaw", duration: 4000 },
  { id: "starting", label: "Starting services", duration: 2000 },
  { id: "complete", label: "Deployment complete", duration: 0 },
]

export default function DeployPage() {
  const router = useRouter()
  const { addDeployment, updateDeployment } = useDeploymentStore()
  
  const [step, setStep] = useState<Step>("configure")
  const [name, setName] = useState("")
  const [region, setRegion] = useState("eastus")
  const [vmSize, setVmSize] = useState("Standard_B2ms")
  const [deploymentId, setDeploymentId] = useState<string | null>(null)
  const [currentDeployStep, setCurrentDeployStep] = useState(0)
  const [deploymentError, setDeploymentError] = useState<string | null>(null)

  const selectedVm = VM_SIZES.find((vm) => vm.value === vmSize)
  const selectedRegion = AZURE_REGIONS.find((r) => r.value === region)

  const handleStartDeployment = async () => {
    setStep("deploy")
    const id = generateDeploymentId()
    setDeploymentId(id)

    // Create initial deployment
    const deployment: Deployment = {
      id,
      name: name || "My OpenClaw Instance",
      status: "provisioning",
      region,
      vmSize,
      createdAt: new Date().toISOString(),
      cost: selectedVm?.price,
    }
    addDeployment(deployment)

    // Simulate deployment steps
    try {
      for (let i = 0; i < deploymentSteps.length - 1; i++) {
        setCurrentDeployStep(i)
        const stepConfig = deploymentSteps[i]
        
        // Update status
        updateDeployment(id, { 
          status: stepConfig.id as Deployment["status"]
        })
        
        await new Promise((resolve) => setTimeout(resolve, stepConfig.duration))
      }

      // Complete
      setCurrentDeployStep(deploymentSteps.length - 1)
      updateDeployment(id, {
        status: "running",
        ipAddress: `20.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        dashboardUrl: `https://openclaw-${id.split("-")[1]}.azurewebsites.net`,
      })
    } catch {
      setDeploymentError("Deployment failed. Please try again.")
      updateDeployment(id, { status: "failed" })
    }
  }

  const progress = (currentDeployStep / (deploymentSteps.length - 1)) * 100
  const isComplete = currentDeployStep === deploymentSteps.length - 1

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold">Deploy OpenClaw</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Configure and deploy your personal AI assistant
        </p>
      </div>

      {/* Steps indicator */}
      <div className="mb-8 flex items-center justify-between">
        {["Configure", "Review", "Deploy"].map((label, index) => {
          const stepNames: Step[] = ["configure", "review", "deploy"]
          const currentStepIndex = stepNames.indexOf(step)
          const isActive = index === currentStepIndex
          const isCompleted = index < currentStepIndex

          return (
            <div key={label} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                    isCompleted
                      ? "bg-[hsl(var(--primary))] text-white"
                      : isActive
                      ? "bg-[hsl(var(--primary))] text-white"
                      : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "hidden text-sm font-medium sm:inline",
                    isActive
                      ? "text-[hsl(var(--foreground))]"
                      : "text-[hsl(var(--muted-foreground))]"
                  )}
                >
                  {label}
                </span>
              </div>
              {index < 2 && (
                <div
                  className={cn(
                    "mx-4 h-0.5 w-12 sm:w-24",
                    index < currentStepIndex
                      ? "bg-[hsl(var(--primary))]"
                      : "bg-[hsl(var(--muted))]"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Configure Step */}
      {step === "configure" && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Choose your deployment settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Deployment Name"
              placeholder="My OpenClaw Instance"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Select
              label="Azure Region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              options={AZURE_REGIONS}
            />

            <div>
              <label className="mb-2 block text-sm font-medium">
                VM Size
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                {VM_SIZES.map((vm) => (
                  <button
                    key={vm.value}
                    type="button"
                    onClick={() => setVmSize(vm.value)}
                    className={cn(
                      "relative rounded-lg border p-4 text-left transition-all",
                      vmSize === vm.value
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 ring-1 ring-[hsl(var(--primary))]"
                        : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50"
                    )}
                  >
                    {vm.value === "Standard_B2ms" && (
                      <Badge className="absolute -top-2 right-2" variant="default">
                        Recommended
                      </Badge>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{vm.label}</span>
                    </div>
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                      {vm.description}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[hsl(var(--primary))]">
                      ${vm.price.toFixed(2)}/mo
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep("review")}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Step */}
      {step === "review" && (
        <Card>
          <CardHeader>
            <CardTitle>Review Configuration</CardTitle>
            <CardDescription>
              Confirm your deployment settings before launching
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-[hsl(var(--muted))] p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                    <Cloud className="h-5 w-5 text-[hsl(var(--primary))]" />
                  </div>
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Name</p>
                    <p className="font-medium">{name || "My OpenClaw Instance"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                    <Globe className="h-5 w-5 text-[hsl(var(--primary))]" />
                  </div>
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Region</p>
                    <p className="font-medium">{selectedRegion?.label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                    <Server className="h-5 w-5 text-[hsl(var(--primary))]" />
                  </div>
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">VM Size</p>
                    <p className="font-medium">{selectedVm?.label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                    <DollarSign className="h-5 w-5 text-[hsl(var(--primary))]" />
                  </div>
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Est. Cost</p>
                    <p className="font-medium">${selectedVm?.price.toFixed(2)}/month</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
              <p className="text-sm text-amber-400">
                <strong>Note:</strong> Deployment typically takes 2-5 minutes. You will be charged based on your Azure subscription.
              </p>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("configure")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleStartDeployment}>
                <Rocket className="mr-2 h-4 w-4" />
                Deploy Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deploy Step */}
      {step === "deploy" && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10">
              {isComplete ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              ) : deploymentError ? (
                <AlertCircle className="h-8 w-8 text-[hsl(var(--destructive))]" />
              ) : (
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
              )}
            </div>
            <CardTitle>
              {isComplete
                ? "Deployment Complete!"
                : deploymentError
                ? "Deployment Failed"
                : "Deploying..."}
            </CardTitle>
            <CardDescription>
              {isComplete
                ? "Your OpenClaw instance is now running"
                : deploymentError
                ? deploymentError
                : "Please wait while we set up your instance"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!deploymentError && (
              <>
                <Progress value={progress} showLabel />

                <div className="space-y-3">
                  {deploymentSteps.map((deployStep, index) => (
                    <div
                      key={deployStep.id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg p-3 transition-colors",
                        index < currentDeployStep
                          ? "bg-emerald-500/10"
                          : index === currentDeployStep
                          ? "bg-[hsl(var(--primary))]/10"
                          : "bg-[hsl(var(--muted))]"
                      )}
                    >
                      {index < currentDeployStep ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : index === currentDeployStep ? (
                        <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--primary))]" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-[hsl(var(--border))]" />
                      )}
                      <span
                        className={cn(
                          "text-sm font-medium",
                          index <= currentDeployStep
                            ? "text-[hsl(var(--foreground))]"
                            : "text-[hsl(var(--muted-foreground))]"
                        )}
                      >
                        {deployStep.label}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {isComplete && (
              <div className="flex justify-center gap-3">
                <Button onClick={() => router.push("/dashboard")}>
                  Go to Dashboard
                </Button>
              </div>
            )}

            {deploymentError && (
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                  Go to Dashboard
                </Button>
                <Button onClick={() => {
                  setDeploymentError(null)
                  setCurrentDeployStep(0)
                  handleStartDeployment()
                }}>
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
