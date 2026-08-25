"use client";

import Link from "next/link";
import Image from "next/image";
import AnimatedCounter from './AnimatedCounter';
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  User,
  Lock,
  ShieldCheck,
  TrendingUp,
  Globe,
} from "lucide-react";
import NavTabs from "./NavTabs";
import GrowthToolsCTA from "./GrowthToolsCTA";
import Reroutee from "@/app/components/Reroutee";

// ---- Data ---------------------------------------------------------------

const securityFeatures = [
  {
    icon: ShieldCheck,
    title: "Military-Grade Encryption",
    description:
      "End-to-end multi-layer security protocols protecting every transaction and asset.",
  },
  {
    icon: TrendingUp,
    title: "Predictive Analytics",
    description:
      "AI-driven insights to help you optimize your portfolio and capital allocation.",
  },
  {
    icon: Globe,
    title: "Global Connectivity",
    description:
      "Move capital across borders with zero-latency execution and real-time conversion.",
  },
];

const footerLinks = [
  { label: "Privacy Policy", href: "Policy" },
  { label: "Security", href: "Policy" },
  { label: "Legal", href: "Policy" },
];

// ---- Animation variants ---------------------------------------------------

const navVariants: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const heroContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const cardsContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const cardFade: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const gridContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const gridItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

// ---- Component ------------------------------------------------------------

export default function AshTrustHero() {
  return (
    <>
      {/* Removed min-h-screen to eliminate the huge empty space */}
      <section className="w-full bg-[#C4F8FD] px-4 pt-9 pb-12 text-[#0a0e17] sm:px-6 md:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Nav */}
          <motion.nav
            initial="hidden"
            animate="visible"
            variants={navVariants}
            className="flex flex-wrap items-center justify-between gap-3 border-none md:flex-nowrap"
          >
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 md:gap-6">
              <Image
                src="/loadLogo_shield_smooth.png"
                alt="Shield logo"
                width={32}
                height={32}
                className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
                priority
              />
              <span className="text-sm font-bold sm:text-base md:text-lg">
                AshTrust <span className="text-cyan-600">Bank</span>
              </span>
              <div className="hidden md:block">
                <NavTabs />
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
              <Link
                href="/log-in"
                className="hidden text-sm text-cyan-600 font-bold transition hover:text-gray-600 sm:inline"
              >
                Log In
              </Link>

              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/sign-up"
                  className="block rounded-md border border-cyan-600/30 px-3 py-1.5 text-xs font-medium text-cyan-600 shadow-sm transition hover:bg-cyan-900/10 sm:px-4 sm:py-2 sm:text-sm"
                >
                  Create account
                </Link>
              </motion.div>
            </div>
          </motion.nav>

          {/* Hero content */}
          <div className="grid grid-cols-1 gap-8 py-8 sm:gap-10 sm:py-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:py-14">
            {/* Left column */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={heroContainer}
              className="flex flex-col items-center text-center lg:items-start lg:text-left"
            >
              <motion.span
                variants={fadeUp}
                className="inline-flex items-center gap-2 rounded-full border-none bg-white/20 px-3 py-1 text-[10px] font-medium tracking-wide text-[#0a0e17] sm:text-[11px]"
              >
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                NEXT GENERATION BANKING
              </motion.span>

              <motion.h1
                variants={fadeUp}
                className="mt-4 text-2xl font-bold leading-tight sm:text-3xl md:text-4xl lg:text-5xl"
              >
                <span className="block">Modern Banking.</span>
                <span className="mt-1 block text-cyan-600">Timeless Trust</span>
              </motion.h1>

              {/* 🟢 FIX 1: Increased font size and line height */}
              <motion.p
                variants={fadeUp}
                className="mt-4 max-w-md text-base leading-loose text-[#0a0e17]/80 sm:text-lg md:max-w-lg"
              >
                Secure Intelligent Banking for Individuals and Businesses around the World. Experience seamless global transfers, predictive insights, and military-grade protection in one unified platform.
              </motion.p>

              {/* 🟢 FIX 2: Centered buttons on mobile/tablet with max width, left-aligned on desktop */}
              <motion.div
                variants={fadeUp}
                className="mt-6 flex w-full flex-col items-center justify-center gap-4 sm:flex-row sm:justify-start sm:gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full max-w-[240px] sm:w-auto sm:max-w-none"
                >
                  <Link
                    href="/sign-up"
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400 sm:w-auto"
                  >
                    Get Started
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full max-w-[240px] sm:w-auto sm:max-w-none"
                >
                  <Link
                    href="/Rates"
                    className="block w-full rounded-md border border-[#0a0e17]/20 px-5 py-2.5 text-sm font-semibold text-[#0a0e17] transition hover:bg-white/20 sm:w-auto"
                  >
                    View rates
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:mt-10 sm:gap-8 lg:justify-start"
              >
                <div className="flex items-center gap-4">
                  <AnimatedCounter
                    value={140}
                    suffix="+ Countries"
                    className="text-sm font-semibold text-[#0a0e17] sm:text-base"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <AnimatedCounter
                    value={24.8}
                    prefix="$"
                    suffix="B+"
                    className="text-sm font-semibold text-[#0a0e17] sm:text-base"
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Right column: cards */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={cardsContainer}
              className="flex flex-col gap-4 sm:gap-5"
            >
              {/* Ash Trust Elite card */}
              <motion.div
                variants={cardFade}
                whileHover={{ y: -4 }}
                className="cursor-pointer rounded-2xl border-none bg-gradient-to-br from-blue-200 via-cyan-200 to-purple-200 p-5 shadow-lg transition-shadow hover:shadow-xl sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900 sm:text-base">
                    AshTrust Bank <span className="text-cyan-700"></span>
                  </p>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/40 text-[#0a0e17] sm:h-10 sm:w-10" />
                </div>

                <p className="mt-8 text-[10px] font-medium tracking-wide text-[#0a0e17] sm:mt-10 sm:text-[11px]">
                  @Username
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="h-5 w-8 rounded-sm bg-white/50 sm:h-6 sm:w-9" />
                  <span className="text-xs font-medium tracking-widest text-[#0a0e17] sm:text-sm">
                    •••• •••• •••• 8820
                  </span>
                </div>
              </motion.div>

              {/* Manage your wealth card */}
              <motion.div
                variants={cardFade}
                whileHover={{ y: -4 }}
                className="cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-br from-blue-200 via-cyan-200 to-purple-200 p-5 shadow-lg transition-shadow hover:shadow-xl sm:p-6"
              >
                <h2 className="text-sm font-semibold text-[#0a0e17] sm:text-base">
                  Manage your wealth
                </h2>

                <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:gap-3">
                  <div className="flex items-center gap-2 rounded-md border border-slate-900/10 bg-white/40 px-3 py-2">
                    <User size={15} className="text-[#0a0e17]" />
                    <input
                      type="text"
                      placeholder="Username or Account ID"
                      className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-500 focus:outline-none sm:text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2 rounded-md border border-slate-900/10 bg-white/40 px-3 py-2">
                    <Lock size={15} className="text-[#0a0e17]" />
                    <input
                      type="password"
                      placeholder="Passcode"
                      className="w-full bg-transparent text-xs text-[#0a0e17] placeholder:text-slate-500 focus:outline-none sm:text-sm"
                    />
                  </div>
                  
                  <Link
                    href="/Dashboard"
                    className="mt-1 block w-full rounded-md border border-cyan-700/40 bg-cyan-700/10 py-2 text-center text-xs font-semibold text-cyan-800 transition hover:bg-cyan-700/20 sm:py-2.5 sm:text-sm"
                  >
                    Sign In
                  </Link>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#0a0e17] sm:mt-4 sm:text-[11px]">
                  <span>
                    <span className="pr-1">New here?</span>
                    <Link
                      href="/sign-up"
                      className="cursor-pointer font-medium text-cyan-800 hover:underline"
                    >
                      Create Account
                    </Link>
                  </span>
                </div>
              </motion.div>

              {/* Market status bar */}
              <motion.div
                variants={cardFade}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[10px] text-[#0a0e17] sm:px-4 sm:py-2.5 sm:text-[11px]"
              >
                <span className="flex items-center gap-1.5">
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                  />
                  MARKET STATUS: OPEN
                </span>
                <span className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <span className="flex items-center gap-1">
                    LUM
                    <AnimatedCounter
                      value={40.24}
                      prefix="+"
                      suffix="%"
                      className="text-[10px] text-emerald-600 sm:text-[12px]"
                    />
                  </span>
                  <span className="flex items-center gap-1">
                    BTC
                    <AnimatedCounter 
                      value={82}
                      prefix="+"
                      suffix="%"
                      className="text-[10px] text-emerald-600 sm:text-[12px]"
                    />
                  </span>
                </span>
              </motion.div>
            </motion.div>
          </div>

          {/* Explore Security Features */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="pb-6 text-center text-[20px] font-bold tracking-wide text-cyan-600 sm:pb-8"
          >
            EXPLORE SECURITY FEATURES
          </motion.p>

          {/* Security features grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={gridContainer}
            className="grid grid-cols-1 gap-4 pb-10 sm:grid-cols-2 sm:gap-5 sm:pb-12 md:grid-cols-3 lg:pb-14"
          >
            {securityFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={gridItem}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-none p-4 transition-shadow hover:shadow-xl sm:p-5"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/20 text-cyan-600 sm:h-9 sm:w-9">
                    <Icon size={17} strokeWidth={2} />
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-[#0a0e17] sm:mt-4 sm:text-[15px]">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#0a0e17]/80 sm:text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* <Reroutee /> */}
          <GrowthToolsCTA />
        </div>
      </section>
      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="border-none backdrop-blur-sm bg-cyan-100"
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-4 text-center text-[10px] text-[#0a0e17] sm:flex-row sm:gap-4 sm:px-6 sm:py-5 sm:text-[11px] sm:text-left">
          <p>© 2024 Ash Trust Bank plc. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="cursor-pointer font-medium uppercase tracking-wide text-cyan-700 transition hover:text-cyan-600"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}