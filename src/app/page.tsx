"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import {
  Cloud,
  Zap,
  Shield,
  Globe,
  Clock,
  Check,
  ArrowRight,
  Sparkles,
  Server,
  Lock,
  Cpu,
} from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "One-Click Deploy",
    description: "Go from zero to running AI assistant in under 5 minutes. No command line required.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Your data stays on your own cloud. Full encryption at rest and in transit.",
  },
  {
    icon: Globe,
    title: "Global Regions",
    description: "Deploy to any Azure region worldwide. Low latency wherever you are.",
  },
  {
    icon: Clock,
    title: "Always Available",
    description: "99.9% uptime SLA. Your AI assistant is always ready when you need it.",
  },
]

const steps = [
  {
    number: "01",
    title: "Create Account",
    description: "Sign up in seconds with email or OAuth.",
  },
  {
    number: "02",
    title: "Configure",
    description: "Choose your region and compute power.",
  },
  {
    number: "03",
    title: "Deploy",
    description: "Click deploy and watch the magic happen.",
  },
  {
    number: "04",
    title: "Connect",
    description: "Access your AI via WhatsApp, web, or API.",
  },
]

const pricing = [
  {
    name: "Starter",
    price: "$7.59",
    period: "/month",
    description: "Perfect for trying out OpenClaw",
    features: [
      "1 vCPU, 1GB RAM",
      "Basic support",
      "Community access",
      "Single deployment",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Pro",
    price: "$30.37",
    period: "/month",
    description: "For personal daily use",
    features: [
      "2 vCPU, 4GB RAM",
      "Priority support",
      "All integrations",
      "Up to 3 deployments",
      "Custom domain",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Business",
    price: "$60.74",
    period: "/month",
    description: "For power users and small teams",
    features: [
      "2 vCPU, 8GB RAM",
      "24/7 support",
      "API access",
      "Unlimited deployments",
      "Team collaboration",
      "Analytics dashboard",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* CloudHack Background gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,140,66,0.15),rgba(255,255,255,0))]" />
        
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="secondary" className="mb-6">
                <Sparkles className="mr-1.5 h-3 w-3" />
                Now in Public Beta
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-4xl font-bold tracking-tight text-[var(--text-dark)] sm:text-6xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Your Personal AI Assistant,{" "}
              <span className="cloudhack-gradient-text">
                Deployed in Minutes
              </span>
            </motion.h1>
            
            <motion.p 
              className="mt-6 text-lg leading-8 text-[hsl(var(--muted-foreground))]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              CloudHack Deploy makes it effortless to run OpenClaw on your own cloud infrastructure.
              No DevOps skills needed. Full control over your data. Deploy once, access everywhere.
            </motion.p>
            
            <motion.div 
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto cloudhack-gradient text-white hover:opacity-90 transition-opacity">
                  Start Deploying
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="w-full sm:w-auto hover:scale-105 transition-transform">
                  See How It Works
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 border-t border-[hsl(var(--border))] pt-10">
              <div>
                <div className="text-3xl font-bold text-[hsl(var(--foreground))]">5 min</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">Average deploy time</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[hsl(var(--foreground))]">8+</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">Global regions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[hsl(var(--foreground))]">99.9%</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">Uptime SLA</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-[hsl(var(--border))] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to deploy AI
            </h2>
            <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))]">
              We handle the complexity so you can focus on what matters — using your AI assistant.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="border-[hsl(var(--border))] bg-[hsl(var(--card))] h-full hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <motion.div 
                        className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg cloudhack-gradient"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </motion.div>
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              From zero to AI in 4 simple steps
            </h2>
            <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))]">
              No Docker, no Terraform, no SSH. Just click and deploy.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-gradient-to-r from-[hsl(var(--primary))] to-transparent lg:block" />
                )}
                <div className="relative flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xl font-bold text-white">
                    {step.number}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="border-t border-[hsl(var(--border))] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))]">
              Pay only for the compute you use. No hidden fees. Cancel anytime.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {pricing.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.popular
                    ? "border-[hsl(var(--primary))] shadow-lg shadow-[hsl(var(--primary))]/20"
                    : "border-[hsl(var(--border))]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge>Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="ml-1 text-[hsl(var(--muted-foreground))]">{plan.period}</span>
                  </div>
                  <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                    {plan.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-[hsl(var(--primary))]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className="mt-8 block">
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-[hsl(var(--border))] bg-gradient-to-br from-orange-500/10 via-red-500/10 to-orange-400/10 py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to deploy your AI assistant?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[hsl(var(--muted-foreground))]">
            Join thousands of users who have already deployed their personal AI with CloudHack Deploy.
            Start your free trial today.
          </p>
          <div className="mt-10">
            <Link href="/signup">
              <Button size="lg">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
