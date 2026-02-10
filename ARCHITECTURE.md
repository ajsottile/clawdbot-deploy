# ClawBot Deploy - Technical Architecture
## MVP Design Document

**Version:** 1.0  
**Date:** February 10, 2026  
**Author:** Architect Agent  
**Status:** Ready for Implementation

---

## Executive Summary

ClawBot Deploy is a web application that enables one-click deployment of OpenClaw instances to Microsoft Azure. This document outlines the MVP architecture designed for launch in **hours, not days**.

### Core Principles
1. **Speed over perfection** - Ship the simplest thing that works
2. **Azure-native** - Leverage managed services to reduce ops burden
3. **Security-first** - Never compromise on auth and secrets
4. **Scalable foundation** - Simple now, but patterns that grow

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLAWBOT DEPLOY                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │   FRONTEND      │    │   BACKEND API   │    │   WORKER        │        │
│  │   Next.js 14    │───▶│   Next.js API   │───▶│   Azure Funcs   │        │
│  │   Vercel        │    │   Routes        │    │   (Deployment)  │        │
│  │   Tailwind      │    │                 │    │                 │        │
│  └─────────────────┘    └────────┬────────┘    └────────┬────────┘        │
│                                  │                      │                  │
│                                  ▼                      ▼                  │
│                    ┌─────────────────────────────────────────┐             │
│                    │           DATA LAYER                    │             │
│                    │  ┌─────────────┐  ┌─────────────────┐  │             │
│                    │  │  Supabase   │  │  Azure Key      │  │             │
│                    │  │  (Postgres) │  │  Vault          │  │             │
│                    │  │  + Auth     │  │  (Secrets)      │  │             │
│                    │  └─────────────┘  └─────────────────┘  │             │
│                    └─────────────────────────────────────────┘             │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                         AZURE INFRASTRUCTURE                                │
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │   Azure VMs     │    │   Azure         │    │   Azure         │        │
│  │   (Customer     │    │   Container     │    │   DNS           │        │
│  │   OpenClaw)     │    │   Registry      │    │                 │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow - Deployment Journey

```
User clicks "Deploy"
        │
        ▼
┌───────────────────┐
│ 1. Frontend       │  Validates config, shows loading state
│    (Next.js)      │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ 2. API Route      │  Creates deployment record, queues job
│    /api/deploy    │  Returns deployment ID immediately
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ 3. Azure Function │  Async worker:
│    (Deployment)   │  - Provisions Resource Group
│                   │  - Deploys ARM template
│                   │  - Configures VM
│                   │  - Installs OpenClaw
│                   │  - Updates status via webhook
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ 4. Status Updates │  Real-time via Supabase Realtime
│    (WebSocket)    │  User sees progress: 10%...50%...100%
└───────────────────┘
```

---

## 2. Tech Stack Recommendations

### Frontend
| Technology | Rationale |
|------------|-----------|
| **Next.js 14** | Full-stack React, API routes built-in, Vercel deployment |
| **TypeScript** | Type safety, better DX, fewer bugs |
| **Tailwind CSS** | Rapid UI development, consistent design |
| **shadcn/ui** | Beautiful, accessible components, copy-paste simplicity |
| **Lucide Icons** | Consistent iconography |

### Backend
| Technology | Rationale |
|------------|-----------|
| **Next.js API Routes** | Same codebase as frontend, simpler deployment |
| **Azure Functions** | Serverless workers for long-running deployments |
| **tRPC** | Type-safe API layer between frontend/backend |

### Data & Auth
| Technology | Rationale |
|------------|-----------|
| **Supabase** | Postgres + Auth + Realtime in one service |
| **Supabase Auth** | Social logins, magic links, JWT tokens |
| **Supabase Realtime** | WebSocket updates for deployment status |

### Infrastructure
| Technology | Rationale |
|------------|-----------|
| **Vercel** | Zero-config Next.js hosting, instant deploys |
| **Azure** | Customer VM deployment target |
| **Azure Key Vault** | Secure storage for Azure credentials |

### Why This Stack?

1. **Next.js + Vercel** = Deploy in minutes, not hours
2. **Supabase** = Database + Auth + Realtime without managing infrastructure
3. **shadcn/ui** = Professional UI without design expertise
4. **Azure Functions** = Long-running deployments without timeout issues
5. **TypeScript everywhere** = Fewer runtime errors, faster development

---

## 3. Database Schema

### Supabase/PostgreSQL Schema

```sql
-- =====================================================
-- CLAWBOT DEPLOY - DATABASE SCHEMA
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS (extends Supabase auth.users)
-- =====================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    company TEXT,
    avatar_url TEXT,
    
    -- Subscription/billing
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    stripe_customer_id TEXT,
    
    -- Azure credentials (encrypted reference to Key Vault)
    azure_credentials_id TEXT,
    
    -- Limits
    max_deployments INTEGER NOT NULL DEFAULT 1,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- DEPLOYMENTS
-- =====================================================
CREATE TABLE public.deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Deployment configuration
    name TEXT NOT NULL,
    region TEXT NOT NULL DEFAULT 'eastus',
    vm_size TEXT NOT NULL DEFAULT 'Standard_B2s',
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',      -- Created, waiting to start
        'provisioning', -- Azure resources being created
        'configuring',  -- VM being configured
        'installing',   -- OpenClaw being installed
        'running',      -- Deployment complete, instance live
        'stopped',      -- User stopped the instance
        'failed',       -- Deployment failed
        'deleted'       -- User deleted the deployment
    )),
    status_message TEXT,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    
    -- Azure resources
    azure_resource_group TEXT,
    azure_vm_id TEXT,
    azure_public_ip TEXT,
    azure_subscription_id TEXT,
    
    -- OpenClaw configuration
    openclaw_version TEXT NOT NULL DEFAULT 'latest',
    openclaw_port INTEGER NOT NULL DEFAULT 3000,
    
    -- Access
    instance_url TEXT,           -- e.g., https://deploy-abc123.clawbot.ai
    admin_password_vault_ref TEXT, -- Reference to Key Vault secret
    
    -- Cost tracking
    estimated_monthly_cost DECIMAL(10,2),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deployed_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- =====================================================
-- DEPLOYMENT LOGS
-- =====================================================
CREATE TABLE public.deployment_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deployment_id UUID NOT NULL REFERENCES public.deployments(id) ON DELETE CASCADE,
    
    level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warn', 'error')),
    message TEXT NOT NULL,
    metadata JSONB,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- AZURE CREDENTIALS (encrypted references)
-- =====================================================
CREATE TABLE public.azure_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL DEFAULT 'Default',
    
    -- We store KEY VAULT references, not actual secrets
    subscription_id TEXT NOT NULL,
    tenant_id_vault_ref TEXT NOT NULL,      -- Key Vault reference
    client_id_vault_ref TEXT NOT NULL,      -- Key Vault reference  
    client_secret_vault_ref TEXT NOT NULL,  -- Key Vault reference
    
    -- Validation
    is_validated BOOLEAN NOT NULL DEFAULT FALSE,
    last_validated_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, name)
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_deployments_user_id ON public.deployments(user_id);
CREATE INDEX idx_deployments_status ON public.deployments(status);
CREATE INDEX idx_deployment_logs_deployment_id ON public.deployment_logs(deployment_id);
CREATE INDEX idx_azure_credentials_user_id ON public.azure_credentials(user_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.azure_credentials ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only see/edit their own
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
    
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Deployments: users can only see/manage their own
CREATE POLICY "Users can view own deployments" ON public.deployments
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert own deployments" ON public.deployments
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update own deployments" ON public.deployments
    FOR UPDATE USING (auth.uid() = user_id);

-- Deployment logs: users can only view logs for their deployments
CREATE POLICY "Users can view own deployment logs" ON public.deployment_logs
    FOR SELECT USING (
        deployment_id IN (
            SELECT id FROM public.deployments WHERE user_id = auth.uid()
        )
    );

-- Azure credentials: users can only see/manage their own
CREATE POLICY "Users can view own azure credentials" ON public.azure_credentials
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert own azure credentials" ON public.azure_credentials
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update own azure credentials" ON public.azure_credentials
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY "Users can delete own azure credentials" ON public.azure_credentials
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_deployments_updated_at
    BEFORE UPDATE ON public.deployments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_azure_credentials_updated_at
    BEFORE UPDATE ON public.azure_credentials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────────┐
│  auth.users     │       │  profiles           │
│  (Supabase)     │       │                     │
├─────────────────┤       ├─────────────────────┤
│ id (PK)         │◀──────│ id (PK, FK)         │
│ email           │       │ email               │
│ ...             │       │ full_name           │
└─────────────────┘       │ plan                │
                          │ azure_credentials_id│
                          └──────────┬──────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
        ┌───────────────────┐  ┌──────────────┐  ┌──────────────────┐
        │ deployments       │  │ azure_       │  │ (future:         │
        │                   │  │ credentials  │  │  billing,        │
        ├───────────────────┤  ├──────────────┤  │  api_keys, etc)  │
        │ id (PK)           │  │ id (PK)      │  └──────────────────┘
        │ user_id (FK)      │  │ user_id (FK) │
        │ name              │  │ name         │
        │ status            │  │ sub_id       │
        │ region            │  │ *_vault_ref  │
        │ vm_size           │  └──────────────┘
        │ azure_vm_id       │
        │ instance_url      │
        └────────┬──────────┘
                 │
                 ▼
        ┌───────────────────┐
        │ deployment_logs   │
        ├───────────────────┤
        │ id (PK)           │
        │ deployment_id(FK) │
        │ level             │
        │ message           │
        │ metadata          │
        └───────────────────┘
```

---

## 4. Azure Integration Approach

### Recommendation: ARM Templates + Azure SDK

For MVP speed, I recommend **ARM Templates** executed via the **Azure SDK for JavaScript**.

#### Why ARM over Terraform?
| Factor | ARM Templates | Terraform |
|--------|--------------|-----------|
| Azure Integration | Native, first-party | Third-party |
| Learning Curve | Lower for Azure experts | Higher |
| Speed to MVP | Faster | Slower |
| State Management | Azure handles it | You manage state |
| Future Migration | Easy to Terraform later | N/A |

### ARM Template Structure

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "vmName": {
      "type": "string",
      "metadata": { "description": "Name of the VM" }
    },
    "vmSize": {
      "type": "string",
      "defaultValue": "Standard_B2s",
      "allowedValues": [
        "Standard_B1s",
        "Standard_B2s", 
        "Standard_B4ms",
        "Standard_D2s_v3"
      ]
    },
    "adminUsername": {
      "type": "string",
      "defaultValue": "clawbot"
    },
    "adminPassword": {
      "type": "securestring"
    },
    "location": {
      "type": "string",
      "defaultValue": "[resourceGroup().location]"
    }
  },
  "variables": {
    "vnetName": "[concat(parameters('vmName'), '-vnet')]",
    "subnetName": "default",
    "publicIPName": "[concat(parameters('vmName'), '-ip')]",
    "nicName": "[concat(parameters('vmName'), '-nic')]",
    "nsgName": "[concat(parameters('vmName'), '-nsg')]"
  },
  "resources": [
    {
      "type": "Microsoft.Network/networkSecurityGroups",
      "apiVersion": "2021-02-01",
      "name": "[variables('nsgName')]",
      "location": "[parameters('location')]",
      "properties": {
        "securityRules": [
          {
            "name": "SSH",
            "properties": {
              "priority": 1000,
              "direction": "Inbound",
              "access": "Allow",
              "protocol": "Tcp",
              "sourcePortRange": "*",
              "destinationPortRange": "22",
              "sourceAddressPrefix": "*",
              "destinationAddressPrefix": "*"
            }
          },
          {
            "name": "OpenClaw",
            "properties": {
              "priority": 1001,
              "direction": "Inbound",
              "access": "Allow",
              "protocol": "Tcp",
              "sourcePortRange": "*",
              "destinationPortRange": "3000",
              "sourceAddressPrefix": "*",
              "destinationAddressPrefix": "*"
            }
          },
          {
            "name": "HTTPS",
            "properties": {
              "priority": 1002,
              "direction": "Inbound",
              "access": "Allow",
              "protocol": "Tcp",
              "sourcePortRange": "*",
              "destinationPortRange": "443",
              "sourceAddressPrefix": "*",
              "destinationAddressPrefix": "*"
            }
          }
        ]
      }
    },
    {
      "type": "Microsoft.Network/publicIPAddresses",
      "apiVersion": "2021-02-01",
      "name": "[variables('publicIPName')]",
      "location": "[parameters('location')]",
      "sku": { "name": "Standard" },
      "properties": {
        "publicIPAllocationMethod": "Static",
        "dnsSettings": {
          "domainNameLabel": "[parameters('vmName')]"
        }
      }
    },
    {
      "type": "Microsoft.Network/virtualNetworks",
      "apiVersion": "2021-02-01",
      "name": "[variables('vnetName')]",
      "location": "[parameters('location')]",
      "properties": {
        "addressSpace": { "addressPrefixes": ["10.0.0.0/16"] },
        "subnets": [
          {
            "name": "[variables('subnetName')]",
            "properties": { "addressPrefix": "10.0.0.0/24" }
          }
        ]
      }
    },
    {
      "type": "Microsoft.Network/networkInterfaces",
      "apiVersion": "2021-02-01",
      "name": "[variables('nicName')]",
      "location": "[parameters('location')]",
      "dependsOn": [
        "[resourceId('Microsoft.Network/publicIPAddresses', variables('publicIPName'))]",
        "[resourceId('Microsoft.Network/virtualNetworks', variables('vnetName'))]",
        "[resourceId('Microsoft.Network/networkSecurityGroups', variables('nsgName'))]"
      ],
      "properties": {
        "ipConfigurations": [
          {
            "name": "ipconfig1",
            "properties": {
              "privateIPAllocationMethod": "Dynamic",
              "publicIPAddress": {
                "id": "[resourceId('Microsoft.Network/publicIPAddresses', variables('publicIPName'))]"
              },
              "subnet": {
                "id": "[resourceId('Microsoft.Network/virtualNetworks/subnets', variables('vnetName'), variables('subnetName'))]"
              }
            }
          }
        ],
        "networkSecurityGroup": {
          "id": "[resourceId('Microsoft.Network/networkSecurityGroups', variables('nsgName'))]"
        }
      }
    },
    {
      "type": "Microsoft.Compute/virtualMachines",
      "apiVersion": "2021-03-01",
      "name": "[parameters('vmName')]",
      "location": "[parameters('location')]",
      "dependsOn": [
        "[resourceId('Microsoft.Network/networkInterfaces', variables('nicName'))]"
      ],
      "properties": {
        "hardwareProfile": { "vmSize": "[parameters('vmSize')]" },
        "osProfile": {
          "computerName": "[parameters('vmName')]",
          "adminUsername": "[parameters('adminUsername')]",
          "adminPassword": "[parameters('adminPassword')]",
          "linuxConfiguration": {
            "disablePasswordAuthentication": false
          }
        },
        "storageProfile": {
          "imageReference": {
            "publisher": "Canonical",
            "offer": "0001-com-ubuntu-server-jammy",
            "sku": "22_04-lts-gen2",
            "version": "latest"
          },
          "osDisk": {
            "createOption": "FromImage",
            "managedDisk": { "storageAccountType": "Standard_LRS" }
          }
        },
        "networkProfile": {
          "networkInterfaces": [
            { "id": "[resourceId('Microsoft.Network/networkInterfaces', variables('nicName'))]" }
          ]
        }
      }
    },
    {
      "type": "Microsoft.Compute/virtualMachines/extensions",
      "apiVersion": "2021-03-01",
      "name": "[concat(parameters('vmName'), '/installOpenClaw')]",
      "location": "[parameters('location')]",
      "dependsOn": [
        "[resourceId('Microsoft.Compute/virtualMachines', parameters('vmName'))]"
      ],
      "properties": {
        "publisher": "Microsoft.Azure.Extensions",
        "type": "CustomScript",
        "typeHandlerVersion": "2.1",
        "autoUpgradeMinorVersion": true,
        "settings": {
          "commandToExecute": "curl -fsSL https://clawbot.ai/install.sh | bash"
        }
      }
    }
  ],
  "outputs": {
    "publicIP": {
      "type": "string",
      "value": "[reference(variables('publicIPName')).ipAddress]"
    },
    "fqdn": {
      "type": "string",
      "value": "[reference(variables('publicIPName')).dnsSettings.fqdn]"
    },
    "vmId": {
      "type": "string",
      "value": "[resourceId('Microsoft.Compute/virtualMachines', parameters('vmName'))]"
    }
  }
}
```

### Azure Deployment Service (TypeScript)

```typescript
// src/lib/azure/deploy.ts
import { DefaultAzureCredential } from "@azure/identity";
import { ResourceManagementClient } from "@azure/arm-resources";
import { ComputeManagementClient } from "@azure/arm-compute";
import { createClient } from "@supabase/supabase-js";

interface DeploymentConfig {
  deploymentId: string;
  userId: string;
  name: string;
  region: string;
  vmSize: string;
  subscriptionId: string;
  credentials: {
    tenantId: string;
    clientId: string;
    clientSecret: string;
  };
}

export async function deployOpenClaw(config: DeploymentConfig) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  
  const updateStatus = async (status: string, progress: number, message?: string) => {
    await supabase
      .from("deployments")
      .update({ status, progress, status_message: message })
      .eq("id", config.deploymentId);
      
    await supabase
      .from("deployment_logs")
      .insert({
        deployment_id: config.deploymentId,
        level: "info",
        message: message || status,
      });
  };

  try {
    // 1. Initialize Azure clients
    await updateStatus("provisioning", 10, "Connecting to Azure...");
    
    const credential = new ClientSecretCredential(
      config.credentials.tenantId,
      config.credentials.clientId,
      config.credentials.clientSecret
    );
    
    const resourceClient = new ResourceManagementClient(
      credential,
      config.subscriptionId
    );

    // 2. Create Resource Group
    await updateStatus("provisioning", 20, "Creating resource group...");
    
    const resourceGroupName = `clawbot-${config.deploymentId.slice(0, 8)}`;
    await resourceClient.resourceGroups.createOrUpdate(resourceGroupName, {
      location: config.region,
      tags: {
        "clawbot-deployment-id": config.deploymentId,
        "clawbot-user-id": config.userId,
        "managed-by": "clawbot-deploy",
      },
    });

    // 3. Deploy ARM Template
    await updateStatus("provisioning", 40, "Deploying infrastructure...");
    
    const deploymentName = `deploy-${Date.now()}`;
    const adminPassword = generateSecurePassword();
    
    const deployment = await resourceClient.deployments.beginCreateOrUpdateAndWait(
      resourceGroupName,
      deploymentName,
      {
        properties: {
          mode: "Incremental",
          template: ARM_TEMPLATE, // The JSON template above
          parameters: {
            vmName: { value: `claw-${config.deploymentId.slice(0, 8)}` },
            vmSize: { value: config.vmSize },
            adminPassword: { value: adminPassword },
            location: { value: config.region },
          },
        },
      }
    );

    // 4. Get deployment outputs
    await updateStatus("configuring", 70, "Configuring VM...");
    
    const outputs = deployment.properties?.outputs as any;
    const publicIP = outputs?.publicIP?.value;
    const fqdn = outputs?.fqdn?.value;
    const vmId = outputs?.vmId?.value;

    // 5. Wait for OpenClaw to be ready
    await updateStatus("installing", 85, "Installing OpenClaw...");
    
    await waitForOpenClaw(`http://${publicIP}:3000/health`, 300000); // 5 min timeout

    // 6. Store password in Key Vault (reference)
    const passwordVaultRef = await storeInKeyVault(
      `deployment-${config.deploymentId}-password`,
      adminPassword
    );

    // 7. Update database with final details
    await supabase
      .from("deployments")
      .update({
        status: "running",
        progress: 100,
        status_message: "Deployment complete!",
        azure_resource_group: resourceGroupName,
        azure_vm_id: vmId,
        azure_public_ip: publicIP,
        instance_url: `http://${publicIP}:3000`,
        admin_password_vault_ref: passwordVaultRef,
        deployed_at: new Date().toISOString(),
      })
      .eq("id", config.deploymentId);

    return { success: true, url: `http://${publicIP}:3000` };
    
  } catch (error) {
    await updateStatus("failed", 0, `Deployment failed: ${error.message}`);
    throw error;
  }
}

async function waitForOpenClaw(url: string, timeout: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Keep trying
    }
    await new Promise(r => setTimeout(r, 5000)); // Check every 5 seconds
  }
  throw new Error("OpenClaw failed to start within timeout");
}

function generateSecurePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  return Array.from({ length: 24 }, () => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}
```

---

## 5. Security & Authentication Strategy

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User                 ClawBot Deploy              Supabase      │
│   │                        │                         │          │
│   │  1. Click "Sign In"    │                         │          │
│   │───────────────────────▶│                         │          │
│   │                        │  2. Redirect to Auth    │          │
│   │                        │────────────────────────▶│          │
│   │                        │                         │          │
│   │  3. OAuth (Google/GitHub) or Magic Link         │          │
│   │◀────────────────────────────────────────────────│          │
│   │                        │                         │          │
│   │  4. Auth callback      │                         │          │
│   │───────────────────────▶│  5. Exchange code      │          │
│   │                        │────────────────────────▶│          │
│   │                        │  6. JWT + Refresh      │          │
│   │                        │◀────────────────────────│          │
│   │  7. Set HTTP-only      │                         │          │
│   │     cookies            │                         │          │
│   │◀───────────────────────│                         │          │
│   │                        │                         │          │
│   │  8. Authenticated!     │                         │          │
│   │───────────────────────▶│  9. RLS enforced       │          │
│   │                        │────────────────────────▶│          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Security Layers

#### Layer 1: Authentication (Supabase Auth)
- **OAuth providers:** Google, GitHub (one-click signup)
- **Magic links:** Email-based passwordless auth
- **JWT tokens:** Short-lived access tokens (1 hour)
- **Refresh tokens:** HTTP-only cookies, 7-day expiry

#### Layer 2: Authorization (Row Level Security)
- All database tables have RLS policies
- Users can only access their own data
- Server-side functions use service role for admin ops

#### Layer 3: Secrets Management (Azure Key Vault)
```
┌─────────────────────────────────────────────────────────────────┐
│                    SECRETS FLOW                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │   User      │    │  ClawBot    │    │   Azure Key Vault   │ │
│  │   Browser   │    │  Backend    │    │                     │ │
│  └──────┬──────┘    └──────┬──────┘    └──────────┬──────────┘ │
│         │                  │                      │            │
│  1. Enter Azure           │                      │            │
│     credentials           │                      │            │
│         │─────────────────▶│                      │            │
│         │                  │  2. Validate creds   │            │
│         │                  │     with Azure       │            │
│         │                  │─────────────────────▶│            │
│         │                  │                      │            │
│         │                  │  3. Store as secrets │            │
│         │                  │─────────────────────▶│            │
│         │                  │                      │            │
│         │                  │  4. Return vault ref │            │
│         │                  │◀─────────────────────│            │
│         │                  │                      │            │
│         │  5. Store ref    │                      │            │
│         │     in Supabase  │                      │            │
│         │◀─────────────────│                      │            │
│         │                  │                      │            │
│  ✓ Actual secrets NEVER stored in our database   │            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Layer 4: Input Validation & Sanitization
```typescript
// src/lib/validation.ts
import { z } from "zod";

export const deploymentConfigSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-z0-9-]+$/, "Name can only contain lowercase letters, numbers, and hyphens"),
  
  region: z.enum([
    "eastus",
    "westus2", 
    "westeurope",
    "southeastasia",
  ], { errorMap: () => ({ message: "Invalid region" }) }),
  
  vmSize: z.enum([
    "Standard_B1s",   // 1 vCPU, 1 GB RAM - $7.59/mo
    "Standard_B2s",   // 2 vCPU, 4 GB RAM - $30.37/mo
    "Standard_B4ms",  // 4 vCPU, 16 GB RAM - $121.47/mo
  ], { errorMap: () => ({ message: "Invalid VM size" }) }),
});

export const azureCredentialsSchema = z.object({
  subscriptionId: z.string().uuid("Invalid subscription ID format"),
  tenantId: z.string().uuid("Invalid tenant ID format"),
  clientId: z.string().uuid("Invalid client ID format"),
  clientSecret: z.string().min(1, "Client secret is required"),
});
```

#### Layer 5: Rate Limiting & Abuse Prevention
```typescript
// src/middleware.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
  analytics: true,
});

export async function rateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
  
  if (!success) {
    throw new Error(`Rate limit exceeded. Try again in ${reset - Date.now()}ms`);
  }
  
  return { limit, remaining, reset };
}
```

### Security Checklist for MVP

| Category | Control | Status |
|----------|---------|--------|
| **Auth** | Supabase Auth with OAuth | ✅ Required |
| **Auth** | HTTP-only cookies for tokens | ✅ Required |
| **Auth** | CSRF protection | ✅ Required |
| **Data** | Row Level Security on all tables | ✅ Required |
| **Data** | Input validation (Zod) | ✅ Required |
| **Secrets** | Azure Key Vault for credentials | ✅ Required |
| **Secrets** | No secrets in code or logs | ✅ Required |
| **Network** | HTTPS everywhere | ✅ Required |
| **Network** | Rate limiting | ✅ Required |
| **Infra** | Environment variables for config | ✅ Required |
| **Monitoring** | Error tracking (Sentry) | 🟡 Post-MVP |
| **Compliance** | Audit logging | 🟡 Post-MVP |

---

## 6. MVP Implementation Roadmap

### Phase 1: Foundation (2-3 hours)
1. Create Next.js project with TypeScript
2. Set up Tailwind + shadcn/ui
3. Configure Supabase project
4. Run database migrations
5. Deploy to Vercel

### Phase 2: Auth & Dashboard (2-3 hours)
1. Implement Supabase Auth (Google OAuth)
2. Create dashboard layout
3. Build deployment list view
4. Add empty state UI

### Phase 3: Azure Integration (3-4 hours)
1. Create Azure credentials form
2. Build ARM template
3. Implement deployment worker (Azure Function)
4. Add real-time status updates

### Phase 4: Polish (2-3 hours)
1. Error handling & loading states
2. Mobile responsiveness
3. Basic documentation
4. Test full flow end-to-end

### Total: ~10-13 hours for working MVP

---

## 7. Cost Estimates

### ClawBot Deploy Infrastructure (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| Vercel | Pro | $20 |
| Supabase | Pro | $25 |
| Azure Functions | Consumption | ~$5 |
| Azure Key Vault | Standard | ~$3 |
| Domain | Annual/12 | ~$1 |
| **Total** | | **~$54/month** |

### Per-Customer Azure VM Costs

| VM Size | Specs | Monthly Cost |
|---------|-------|--------------|
| Standard_B1s | 1 vCPU, 1 GB | $7.59 |
| Standard_B2s | 2 vCPU, 4 GB | $30.37 |
| Standard_B4ms | 4 vCPU, 16 GB | $121.47 |

### Unit Economics Example

If charging $29/month for hosting:
- Customer pays: $29
- Azure cost (B2s): ~$30
- **Margin: -$1** ❌

Better pricing model:
- Customer pays: $49/month (includes support + management)
- Azure cost (B2s): ~$30
- Our infra share: ~$1
- **Margin: $18 (37%)** ✅

---

## 8. Future Considerations (Post-MVP)

### Near-term Enhancements
- [ ] Multiple Azure subscriptions per user
- [ ] Custom domains for deployments
- [ ] Automatic SSL via Caddy/Traefik
- [ ] Deployment templates (dev/prod configs)
- [ ] Usage analytics dashboard

### Medium-term Features  
- [ ] AWS support (EC2)
- [ ] GCP support (Compute Engine)
- [ ] Team/organization accounts
- [ ] API access for automation
- [ ] Scheduled backups

### Long-term Vision
- [ ] Kubernetes deployment option
- [ ] Multi-region deployments
- [ ] Auto-scaling
- [ ] Marketplace of OpenClaw plugins
- [ ] White-label solution for enterprises

---

## Appendix A: Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Azure (for Key Vault access)
AZURE_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AZURE_KEY_VAULT_URL=https://clawbot-vault.vault.azure.net/

# Rate Limiting (Upstash)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxxxxxxx

# App
NEXT_PUBLIC_APP_URL=https://deploy.clawbot.ai
```

---

## Appendix B: API Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/callback` | OAuth callback handler |
| GET | `/api/deployments` | List user's deployments |
| POST | `/api/deployments` | Create new deployment |
| GET | `/api/deployments/[id]` | Get deployment details |
| DELETE | `/api/deployments/[id]` | Delete deployment |
| POST | `/api/deployments/[id]/start` | Start stopped VM |
| POST | `/api/deployments/[id]/stop` | Stop running VM |
| POST | `/api/azure/credentials` | Save Azure credentials |
| POST | `/api/azure/validate` | Validate Azure credentials |

---

*Architecture designed for speed. Ship it.* 🚀
