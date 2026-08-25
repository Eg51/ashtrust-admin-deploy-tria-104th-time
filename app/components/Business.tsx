"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import BusinessGrowthHero from "@/app/components/BusinessGrowthHero";
import CommercialCapital from "@/app/components/CommercialCapital";
import TreasuryFeatureGrid from "@/app/components/TreasuryFeatureGrid";
import GrowthToolsCTA from "@/app/components/GrowthToolsCTA";
import NavTabs from "./NavTabs";

// ---- Data ---------------------------------------------------------------

const footerLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Security Audit", href: "#" },
  { label: "Legal", href: "#" },
];

// ---- Animation variants ---------------------------------------------------

const navVariants: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// ---- Component ------------------------------------------------------------

export default function Page() {
  return (
    <div className="flex border-none min-h-screen flex-col">
      {/* Header */}
      <motion.nav
        initial="hidden"
        animate="visible"
        variants={navVariants}
        className="top-0 z-50 border-none flex flex-wrap items-center justify-between gap-4 
         px-4"
      >
        {/* <div className="flex flex-wrap items-center to-gray-300 gap-4 sm:gap-10">
          <Image
            src="/loadLogo_shield_smooth.png"
            alt="Shield logo"
            width={28}
            height={28}
            className="h-7 w-7"
          />
          <span className="text-base font-bold text-[#0a0e17] sm:text-lg">
            Ash Trust <span className="text-cyan-700">Bank</span>
          </span>
          <NavTabs />
        </div> */}

        <div className="flex items-center gap-3 sm:gap-4">
          {/* <motion.div whileHover="hover" initial="rest" animate="rest" className="relative hidden sm:block">
            <Link
              href="/log-in"
              className="text-sm text-[#0a0e17]/70 transition-colors hover:text-[#0a0e17]"
            >
              Log In
            </Link>
            <motion.span
              variants={{
                rest: { scaleX: 0, opacity: 0 },
                hover: { scaleX: 1, opacity: 1 },
              }}
              transition={{ duration: 0.2 }}
              className="absolute -bottom-1 left-0 h-[1.5px] w-full origin-left rounded-full bg-cyan-700"
            />
          </motion.div>
          <Link href={'sign-up'}>
            <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                className="rounded-md border border-cyan-700 px-3.5 py-1.5 text-xs font-medium text-cyan-700 transition-colors
                hover:bg-cyan-700/10 active:bg-cyan-700/20 sm:px-4 sm:text-sm"
            >
                Open Account
            </motion.button>
         </Link>  */}
        </div>
      </motion.nav>

      {/* Page sections — each reveals on scroll */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionReveal}
      >
        <BusinessGrowthHero />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionReveal}
      >
        <CommercialCapital />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionReveal}
      >
        <TreasuryFeatureGrid />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionReveal}
      >
        <GrowthToolsCTA />
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="border-t border-black/5 bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300"
      >
        {/* <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4
         py-6 text-center text-[11px] text-[#0a0e17] sm:flex-row sm:px-6 sm:text-left">
          <p>© 2024 Ash Trust Bank plc. All rights reserved. Member FDIC.</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {footerLinks.map((link) => (
              <motion.div key={link.label} whileHover={{ y: -1 }} className="inline-block">
                <Link
                  href={link.href}
                  className="font-medium uppercase tracking-wide text-cyan-700 transition-colors hover:text-cyan-600 active:text-cyan-800"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>
        </div> */}
      </motion.div>
    </div>
  );
}
