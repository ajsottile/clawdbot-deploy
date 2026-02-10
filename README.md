# ClawBot Deploy 🚀

> One-click OpenClaw deployment platform. Deploy your personal AI assistant in minutes.

![ClawBot Deploy](https://img.shields.io/badge/version-0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)

## Overview

ClawBot Deploy is a SaaS platform that makes deploying OpenClaw instances to Azure effortless. No DevOps skills required - just configure, click, and your AI assistant is live.

### Key Features

- 🚀 **One-Click Deploy** - Go from zero to running AI in under 5 minutes
- 🔒 **Secure by Default** - Your data stays on your own cloud infrastructure
- 🌍 **Global Regions** - Deploy to 8+ Azure regions worldwide
- 📊 **Dashboard** - Manage all your deployments from one place
- 💰 **Cost Tracking** - See exactly what you're spending

## Tech Stack

- **Frontend:** Next.js 16 with App Router
- **Styling:** Tailwind CSS 4
- **State Management:** Zustand
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Cloud:** Azure VM deployment
- **TypeScript:** Full type safety

## Getting Started

### Prerequisites

- Node.js 20+ (22 recommended)
- npm or pnpm
- Supabase account (for auth/database)
- Azure subscription (for deployments)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/clawbot-deploy.git
cd clawbot-deploy

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |
| `AZURE_TENANT_ID` | Azure AD tenant ID |
| `AZURE_CLIENT_ID` | Azure service principal client ID |
| `AZURE_CLIENT_SECRET` | Azure service principal secret |

## Project Structure

```
clawbot-deploy/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── login/             # Authentication
│   │   ├── signup/
│   │   ├── dashboard/         # User dashboard
│   │   ├── deploy/            # Deployment wizard
│   │   └── settings/          # User settings
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   └── layout/            # Layout components
│   │       ├── navbar.tsx
│   │       └── footer.tsx
│   ├── store/                 # Zustand state stores
│   │   ├── auth-store.ts
│   │   └── deployment-store.ts
│   └── lib/                   # Utilities
│       └── utils.ts
├── public/                    # Static assets
└── ...config files
```

## Features

### Landing Page
- Modern, premium design (Vercel/Linear-inspired)
- Feature highlights
- Pricing tiers
- Social proof

### Authentication
- Email/password login
- OAuth (GitHub, Google)
- Secure session management

### Deployment Wizard
1. **Configure** - Name, region, VM size
2. **Review** - Confirm settings and pricing
3. **Deploy** - Real-time progress tracking

### Dashboard
- View all deployments
- Start/stop/restart instances
- See costs and IP addresses
- Quick access to OpenClaw dashboard

### Settings
- Profile management
- Billing & subscription
- Notification preferences
- Security settings

## API Routes (Coming Soon)

```
POST /api/deployments          # Create new deployment
GET  /api/deployments          # List deployments
GET  /api/deployments/:id      # Get deployment details
PUT  /api/deployments/:id      # Update deployment
DELETE /api/deployments/:id    # Delete deployment
POST /api/deployments/:id/start
POST /api/deployments/:id/stop
POST /api/deployments/:id/restart
```

## Azure Integration

ClawBot Deploy uses Azure Resource Manager to provision:
- Azure VMs (B-series burstable)
- Virtual Networks
- Network Security Groups
- Public IP addresses
- Managed disks

All resources are tagged and can be managed via Azure Portal.

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/clawbot-deploy)

### Docker

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- 📧 Email: support@clawbot.dev
- 💬 Discord: [Join our community](https://discord.gg/clawbot)
- 📚 Docs: [docs.clawbot.dev](https://docs.clawbot.dev)

---

Built with ❤️ by the ClawBot team
