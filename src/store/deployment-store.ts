import { create } from 'zustand'

export type DeploymentStatus = 
  | 'pending' 
  | 'provisioning' 
  | 'configuring' 
  | 'installing' 
  | 'running' 
  | 'stopped' 
  | 'failed'

export interface Deployment {
  id: string
  name: string
  status: DeploymentStatus
  region: string
  vmSize: string
  createdAt: string
  ipAddress?: string
  dashboardUrl?: string
  cost?: number
}

export interface DeploymentConfig {
  name: string
  region: string
  vmSize: string
}

interface DeploymentState {
  deployments: Deployment[]
  currentDeployment: Deployment | null
  isDeploying: boolean
  error: string | null
  
  // Actions
  setDeployments: (deployments: Deployment[]) => void
  addDeployment: (deployment: Deployment) => void
  updateDeployment: (id: string, updates: Partial<Deployment>) => void
  removeDeployment: (id: string) => void
  setCurrentDeployment: (deployment: Deployment | null) => void
  setIsDeploying: (isDeploying: boolean) => void
  setError: (error: string | null) => void
}

export const useDeploymentStore = create<DeploymentState>((set) => ({
  deployments: [],
  currentDeployment: null,
  isDeploying: false,
  error: null,

  setDeployments: (deployments) => set({ deployments }),
  
  addDeployment: (deployment) =>
    set((state) => ({ deployments: [deployment, ...state.deployments] })),
  
  updateDeployment: (id, updates) =>
    set((state) => ({
      deployments: state.deployments.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
      currentDeployment:
        state.currentDeployment?.id === id
          ? { ...state.currentDeployment, ...updates }
          : state.currentDeployment,
    })),
  
  removeDeployment: (id) =>
    set((state) => ({
      deployments: state.deployments.filter((d) => d.id !== id),
      currentDeployment:
        state.currentDeployment?.id === id ? null : state.currentDeployment,
    })),
  
  setCurrentDeployment: (deployment) => set({ currentDeployment: deployment }),
  
  setIsDeploying: (isDeploying) => set({ isDeploying }),
  
  setError: (error) => set({ error }),
}))

// Azure regions
export const AZURE_REGIONS = [
  { value: 'eastus', label: 'East US (Virginia)' },
  { value: 'westus2', label: 'West US 2 (Washington)' },
  { value: 'westeurope', label: 'West Europe (Netherlands)' },
  { value: 'northeurope', label: 'North Europe (Ireland)' },
  { value: 'southeastasia', label: 'Southeast Asia (Singapore)' },
  { value: 'australiaeast', label: 'Australia East (Sydney)' },
  { value: 'japaneast', label: 'Japan East (Tokyo)' },
  { value: 'brazilsouth', label: 'Brazil South (São Paulo)' },
]

// VM sizes
export const VM_SIZES = [
  { 
    value: 'Standard_B1s', 
    label: 'Starter (1 vCPU, 1GB RAM)', 
    price: 7.59,
    description: 'Great for getting started',
  },
  { 
    value: 'Standard_B2s', 
    label: 'Basic (2 vCPU, 4GB RAM)', 
    price: 30.37,
    description: 'Good for personal use',
  },
  { 
    value: 'Standard_B2ms', 
    label: 'Standard (2 vCPU, 8GB RAM)', 
    price: 60.74,
    description: 'Recommended for most users',
  },
  { 
    value: 'Standard_B4ms', 
    label: 'Performance (4 vCPU, 16GB RAM)', 
    price: 121.47,
    description: 'For power users',
  },
]
