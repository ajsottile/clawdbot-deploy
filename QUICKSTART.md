# ClawBot Deploy - Quick Start Implementation Guide

**Goal:** Get from zero to deployed MVP in under a day.

---

## Step 0: Prerequisites (5 min)

```bash
# Ensure you have:
node --version  # v18+
npm --version   # v9+

# Accounts needed:
# - Vercel account (vercel.com)
# - Supabase account (supabase.com) 
# - Azure account with ability to create Service Principals
```

---

## Step 1: Create Next.js Project (10 min)

```bash
# Create project
npx create-next-app@latest clawbot-deploy \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd clawbot-deploy

# Install dependencies
npm install @supabase/supabase-js @supabase/ssr @supabase/auth-helpers-nextjs
npm install @azure/identity @azure/arm-resources @azure/arm-compute @azure/keyvault-secrets
npm install zod react-hook-form @hookform/resolvers
npm install lucide-react class-variance-authority clsx tailwind-merge

# Install shadcn/ui
npx shadcn-ui@latest init
# Choose: New York style, Slate color, CSS variables: yes

# Add key components
npx shadcn-ui@latest add button card input label form toast
npx shadcn-ui@latest add dialog dropdown-menu avatar badge progress
npx shadcn-ui@latest add table tabs select alert
```

---

## Step 2: Project Structure

```
clawbot-deploy/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── callback/route.ts
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   ├── deployments/
│   │   │   │   ├── page.tsx          # List deployments
│   │   │   │   ├── new/page.tsx      # New deployment
│   │   │   │   └── [id]/page.tsx     # Deployment detail
│   │   │   └── settings/
│   │   │       └── page.tsx          # Azure credentials
│   │   ├── api/
│   │   │   ├── deployments/
│   │   │   │   ├── route.ts          # GET/POST
│   │   │   │   └── [id]/route.ts     # GET/DELETE
│   │   │   └── azure/
│   │   │       ├── credentials/route.ts
│   │   │       └── validate/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx                  # Landing page
│   ├── components/
│   │   ├── ui/                       # shadcn components
│   │   ├── dashboard/
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── deployment-card.tsx
│   │   └── forms/
│   │       ├── azure-credentials-form.tsx
│   │       └── new-deployment-form.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── server.ts             # Server client
│   │   │   └── middleware.ts
│   │   ├── azure/
│   │   │   ├── deploy.ts             # Deployment logic
│   │   │   ├── templates/
│   │   │   │   └── openclaw-vm.json  # ARM template
│   │   │   └── key-vault.ts
│   │   ├── validations.ts            # Zod schemas
│   │   └── utils.ts
│   └── types/
│       ├── database.ts               # Supabase types
│       └── index.ts
├── supabase/
│   └── migrations/
│       └── 001_initial.sql
└── azure-functions/                  # Separate deployment worker
    └── deploy-worker/
        ├── index.ts
        └── function.json
```

---

## Step 3: Supabase Setup (15 min)

### 3.1 Create Project
1. Go to supabase.com → New Project
2. Name: `clawbot-deploy`
3. Generate a strong database password
4. Choose region closest to your users

### 3.2 Run Migration
Go to SQL Editor and run the schema from ARCHITECTURE.md Section 3.

### 3.3 Configure Auth
1. Authentication → Providers → Enable Google
2. Add OAuth credentials from Google Cloud Console
3. Set redirect URL: `https://your-domain.com/auth/callback`

### 3.4 Get Keys
Settings → API:
- Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

---

## Step 4: Core Implementation Files

### 4.1 Supabase Client Setup

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

### 4.2 Dashboard Layout

```typescript
// src/app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:pl-72">
        <Header user={user} />
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
```

### 4.3 Deployments API

```typescript
// src/app/api/deployments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deploymentConfigSchema } from '@/lib/validations'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('deployments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = deploymentConfigSchema.safeParse(body)
  
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Create deployment record
  const { data: deployment, error } = await supabase
    .from('deployments')
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      region: parsed.data.region,
      vm_size: parsed.data.vmSize,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Trigger deployment worker (Azure Function or background job)
  await triggerDeploymentWorker(deployment.id)

  return NextResponse.json(deployment)
}

async function triggerDeploymentWorker(deploymentId: string) {
  // Option 1: Call Azure Function directly
  // Option 2: Use Supabase Edge Function
  // Option 3: Use a queue (Upstash QStash)
  
  // For MVP, we can use a simple fetch to Azure Function
  await fetch(process.env.AZURE_FUNCTION_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deploymentId }),
  })
}
```

### 4.4 New Deployment Form

```typescript
// src/components/forms/new-deployment-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Rocket, Server, Globe } from 'lucide-react'

const formSchema = z.object({
  name: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  region: z.enum(['eastus', 'westus2', 'westeurope', 'southeastasia']),
  vmSize: z.enum(['Standard_B1s', 'Standard_B2s', 'Standard_B4ms']),
})

type FormData = z.infer<typeof formSchema>

const regions = [
  { value: 'eastus', label: 'East US (Virginia)', flag: '🇺🇸' },
  { value: 'westus2', label: 'West US 2 (Washington)', flag: '🇺🇸' },
  { value: 'westeurope', label: 'West Europe (Netherlands)', flag: '🇳🇱' },
  { value: 'southeastasia', label: 'Southeast Asia (Singapore)', flag: '🇸🇬' },
]

const vmSizes = [
  { value: 'Standard_B1s', label: 'Starter', specs: '1 vCPU, 1 GB RAM', price: '$7.59/mo' },
  { value: 'Standard_B2s', label: 'Standard', specs: '2 vCPU, 4 GB RAM', price: '$30.37/mo', recommended: true },
  { value: 'Standard_B4ms', label: 'Performance', specs: '4 vCPU, 16 GB RAM', price: '$121.47/mo' },
]

export function NewDeploymentForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      region: 'eastus',
      vmSize: 'Standard_B2s',
    },
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    try {
      const response = await fetch('/api/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) throw new Error('Failed to create deployment')
      
      const deployment = await response.json()
      router.push(`/deployments/${deployment.id}`)
    } catch (error) {
      console.error(error)
      // Show toast error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Instance Name */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Instance Name
          </CardTitle>
          <CardDescription>
            Choose a unique name for your OpenClaw instance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="my-openclaw"
              {...form.register('name')}
            />
            <p className="text-sm text-muted-foreground">
              Lowercase letters, numbers, and hyphens only
            </p>
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Region Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Region
          </CardTitle>
          <CardDescription>
            Select the Azure region closest to your users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={form.watch('region')}
            onValueChange={(value) => form.setValue('region', value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  <span className="flex items-center gap-2">
                    <span>{region.flag}</span>
                    <span>{region.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* VM Size Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Instance Size</CardTitle>
          <CardDescription>
            Choose the computing power for your instance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {vmSizes.map((size) => (
              <label
                key={size.value}
                className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${
                  form.watch('vmSize') === size.value
                    ? 'border-primary ring-2 ring-primary'
                    : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  value={size.value}
                  className="sr-only"
                  {...form.register('vmSize')}
                />
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <span className="block text-sm font-medium">
                      {size.label}
                      {size.recommended && (
                        <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          Recommended
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {size.specs}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{size.price}</span>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Deploying...
          </>
        ) : (
          <>
            <Rocket className="mr-2 h-5 w-5" />
            Deploy OpenClaw
          </>
        )}
      </Button>
    </form>
  )
}
```

---

## Step 5: Deploy to Vercel (5 min)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - AZURE_FUNCTION_URL (after setting up Azure Function)
```

---

## Step 6: Azure Function Worker (30 min)

Create a separate Azure Functions project for the deployment worker:

```bash
# Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# Create function project
func init azure-functions --typescript
cd azure-functions
func new --name deploy-worker --template "HTTP trigger"
```

The worker code is in ARCHITECTURE.md Section 4.

---

## What You'll Have

After following this guide:

✅ Landing page with value proposition  
✅ Google OAuth login  
✅ Dashboard showing deployments  
✅ New deployment form with region/size selection  
✅ Real-time deployment progress  
✅ Azure VM provisioning with OpenClaw  
✅ Professional UI with shadcn/ui  

---

## Next Steps After MVP

1. Add more OAuth providers (GitHub, Microsoft)
2. Implement deployment management (start/stop/delete)
3. Add usage analytics
4. Set up Stripe for billing
5. Add custom domain support

---

*Ship it. Iterate. Win.* 🚀
