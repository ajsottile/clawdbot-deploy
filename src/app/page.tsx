"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import {
  Zap,
  Shield,
  Globe,
  Clock,
  Check,
  ArrowRight,
  Sparkles,
} from "lucide-react"

/* ───── data (unchanged) ───── */

const features = [
  {
    icon: Zap,
    title: "One-Click Deploy",
    description:
      "Go from zero to running AI assistant in under 5 minutes. No command line required.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Your data stays on your own cloud. Full encryption at rest and in transit.",
  },
  {
    icon: Globe,
    title: "Global Regions",
    description:
      "Deploy to any Azure region worldwide. Low latency wherever you are.",
  },
  {
    icon: Clock,
    title: "Always Available",
    description:
      "99.9% uptime SLA. Your AI assistant is always ready when you need it.",
  },
]

const steps = [
  { number: "01", title: "Create Account", description: "Sign up in seconds with email or OAuth." },
  { number: "02", title: "Configure", description: "Choose your region and compute power." },
  { number: "03", title: "Deploy", description: "Click deploy and watch the magic happen." },
  { number: "04", title: "Connect", description: "Access your AI via WhatsApp, web, or API." },
]

const pricing = [
  {
    name: "Starter",
    price: "$7.59",
    period: "/month",
    description: "Perfect for trying out OpenClaw",
    features: ["1 vCPU, 1GB RAM", "Basic support", "Community access", "Single deployment"],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Pro",
    price: "$30.37",
    period: "/month",
    description: "For personal daily use",
    features: ["2 vCPU, 4GB RAM", "Priority support", "All integrations", "Up to 3 deployments", "Custom domain"],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Business",
    price: "$60.74",
    period: "/month",
    description: "For power users and small teams",
    features: ["2 vCPU, 8GB RAM", "24/7 support", "API access", "Unlimited deployments", "Team collaboration", "Analytics dashboard"],
    cta: "Contact Sales",
    popular: false,
  },
]

const trustedBy = ["Acme Corp", "Globex", "Initech", "Umbrella", "Stark Industries", "Wayne Ent."]

/* ───── helpers ───── */

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const end = value
    const duration = 1500
    const stepTime = 16
    const steps = duration / stepTime
    const increment = end / steps
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, stepTime)
    return () => clearInterval(timer)
  }, [isInView, value])

  return (
    <span ref={ref} className="counter-value">
      {count}
      {suffix}
    </span>
  )
}

/* ───── floating particles background ───── */

function FloatingParticles({ count = 20, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="floating-particle absolute rounded-full"
          style={{
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `rgba(255, ${Math.floor(100 + Math.random() * 56)}, ${Math.floor(40 + Math.random() * 60)}, ${0.2 + Math.random() * 0.3})`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${4 + Math.random() * 6}s`,
          }}
        />
      ))}
    </div>
  )
}

/* ───── section animation wrapper ───── */

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
}

/* ═══════════════════════════════════════════ */
/*                   PAGE                      */
/* ═══════════════════════════════════════════ */

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ────────────── HERO ────────────── */}
      <section className="relative overflow-hidden hero-dark">
        {/* Glowing radial overlay */}
        <div className="hero-glow absolute inset-0 -z-0" />
        {/* Dot grid */}
        <div className="dot-grid-animated absolute inset-0 -z-0" />
        {/* Floating particles */}
        <FloatingParticles count={30} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-28 sm:px-6 sm:py-40 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-8 bg-white/10 text-white/90 border-white/20 backdrop-blur-sm">
                <Sparkles className="mr-1.5 h-3 w-3" />
                Now in Public Beta
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl leading-[1.1]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              Your Personal AI Assistant,{" "}
              <span className="cloudhack-gradient-text-animated">
                Deployed in Minutes
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
            >
              CloudHack Deploy makes it effortless to run OpenClaw on your own
              cloud infrastructure. No DevOps skills needed. Full control over
              your data. Deploy once, access everywhere.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55 }}
            >
              <Link href="/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto cloudhack-gradient text-white border-0 text-base px-8 py-6 hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/25"
                >
                  Start Deploying
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-white/20 text-white bg-white/5 hover:bg-white/10 text-base px-8 py-6 transition-all"
                >
                  See How It Works
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="mt-20 grid grid-cols-3 gap-8 border-t border-white/10 pt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.75 }}
            >
              <div>
                <div className="text-4xl font-bold text-white">
                  <AnimatedCounter value={5} suffix=" min" />
                </div>
                <div className="mt-1 text-sm text-white/50">Average deploy time</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white">
                  <AnimatedCounter value={8} suffix="+" />
                </div>
                <div className="mt-1 text-sm text-white/50">Global regions</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white">
                  <AnimatedCounter value={99} suffix=".9%" />
                </div>
                <div className="mt-1 text-sm text-white/50">Uptime SLA</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Trusted-by strip */}
        <div className="relative z-10 border-t border-white/10 bg-white/[0.03] py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-white/40">
              Trusted by teams everywhere
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
              {trustedBy.map((name) => (
                <span
                  key={name}
                  className="text-sm font-semibold text-white/25 transition-colors hover:text-white/60"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ────────────── FEATURES ────────────── */}
      <section id="features" className="relative py-28 bg-[hsl(var(--background))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Everything you need to{" "}
              <span className="cloudhack-gradient-text">deploy AI</span>
            </h2>
            <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))]">
              We handle the complexity so you can focus on what matters — using
              your AI assistant.
            </p>
          </motion.div>

          <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.12 }}
                  viewport={{ once: true }}
                >
                  <Card className="card-hover-glow h-full border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                    <CardContent className="p-6">
                      <motion.div
                        className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl cloudhack-gradient shadow-lg shadow-orange-500/20"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </motion.div>
                      <h3 className="text-lg font-bold">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
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

      {/* ────────────── HOW IT WORKS ────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[hsl(var(--muted))]/40 to-[hsl(var(--background))] py-28">
        <div className="dot-grid absolute inset-0 opacity-40" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              From zero to AI in{" "}
              <span className="cloudhack-gradient-text">4 simple steps</span>
            </h2>
            <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))]">
              No Docker, no Terraform, no SSH. Just click and deploy.
            </p>
          </motion.div>

          <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-10 hidden h-[2px] w-full lg:block">
                    <motion.div
                      className="h-full cloudhack-gradient"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.3 + index * 0.2 }}
                      viewport={{ once: true }}
                      style={{ transformOrigin: "left" }}
                    />
                  </div>
                )}
                <div className="relative flex flex-col items-center text-center">
                  <motion.div
                    className="flex h-20 w-20 items-center justify-center rounded-full cloudhack-gradient text-2xl font-bold text-white shadow-lg shadow-orange-500/25 pulse-glow"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    {step.number}
                  </motion.div>
                  <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────── PRICING ────────────── */}
      <section id="pricing" className="relative py-28 bg-[hsl(var(--background))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Simple,{" "}
              <span className="cloudhack-gradient-text">transparent</span>{" "}
              pricing
            </h2>
            <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))]">
              Pay only for the compute you use. No hidden fees. Cancel anytime.
            </p>
          </motion.div>

          <div className="mt-20 grid gap-8 lg:grid-cols-3">
            {pricing.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
              >
                <Card
                  className={`relative h-full transition-shadow duration-300 ${
                    plan.popular
                      ? "gradient-border shadow-xl shadow-orange-500/10"
                      : "border-[hsl(var(--border))] hover:shadow-lg"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Badge className="cloudhack-gradient border-0 text-white shadow-md">Most Popular</Badge>
                    </div>
                  )}
                  <CardContent className="p-8">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-5xl font-extrabold">{plan.price}</span>
                      <span className="ml-1 text-[hsl(var(--muted-foreground))]">
                        {plan.period}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
                      {plan.description}
                    </p>
                    <ul className="mt-8 space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-3 text-sm"
                        >
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10">
                            <Check className="h-3 w-3 text-[hsl(var(--primary))]" />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href="/signup" className="mt-8 block">
                      <Button
                        className={`w-full py-6 text-base ${
                          plan.popular
                            ? "cloudhack-gradient text-white border-0 hover:opacity-90 shadow-md shadow-orange-500/20"
                            : ""
                        }`}
                        variant={plan.popular ? "default" : "outline"}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────── CTA ────────────── */}
      <section className="relative overflow-hidden hero-dark py-28">
        <div className="hero-glow absolute inset-0" />
        <FloatingParticles count={25} />
        <div className="dot-grid-animated absolute inset-0 opacity-30" />

        <motion.div
          className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Ready to deploy your{" "}
            <span className="cloudhack-gradient-text-animated">AI assistant</span>?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            Join thousands of users who have already deployed their personal AI
            with CloudHack Deploy. Start your free trial today.
          </p>
          <div className="mt-12">
            <Link href="/signup">
              <Button
                size="lg"
                className="cloudhack-gradient text-white border-0 text-base px-10 py-7 hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/25"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
