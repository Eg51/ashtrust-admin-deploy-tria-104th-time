"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export interface NavTab {
  label: string;
  href?: string;
}

interface NavTabsProps {
  tabs?: NavTab[];
  className?: string;
}

// Updated default tabs to match what you circled in the screenshot
const DEFAULT_TABS: NavTab[] = [
  { label: "Personal", href: "/" },
  { label: "Business", href: "/Business" },
];

export default function NavTabs({
  tabs = DEFAULT_TABS,
  className = "",
}: NavTabsProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Helper to determine if a tab is active based on the current URL path
  const isTabActive = (tabHref: string = "#") => {
    if (tabHref === "/") {
      // Special case for the home page: active only if strictly at root
      return pathname === "/";
    }
    // For other pages, check if the pathname starts with the tab's href
    return pathname.startsWith(tabHref);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Desktop tabs */}
      <div
        role="tablist"
        aria-label="Primary navigation"
        className="hidden bg-transparent items-center gap-7 text-sm sm:flex"
      >
        {tabs.map((tab) => {
          const isActive = isTabActive(tab.href);
          return (
            <Link
              key={tab.label}
              href={tab.href ?? "#"}
              role="tab"
              aria-selected={isActive}
              onClick={() => setMobileOpen(false)}
              className={`relative py-1 transition-colors ${
                isActive 
                  ? "text-cyan-700 font-semibold" 
                  : "text-[#0a0e17]/80 hover:text-cyan-600"
              }`}
            >
              {tab.label}
              {/* Underline indicator */}
              <span
                className={`absolute -bottom-[21px] left-0 h-[2px] w-full rounded-full bg-cyan-500 transition-opacity ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />
            </Link>
          );
        })}
      </div>

      {/* Mobile trigger */}
      <button
        type="button"
        aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((prev) => !prev)}
        className="flex items-center justify-center rounded-md p-1.5 text-[#0a0e17] transition hover:bg-white/20 sm:hidden"
      >
        <AnimatePresence mode="wait" initial={false}>
          {mobileOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={20} />
            </motion.span>
          ) : (
            <motion.span
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Menu size={20} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Mobile dropdown panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            role="tablist"
            aria-label="Primary navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white/90 shadow-xl backdrop-blur sm:hidden"
          >
            <div className="flex flex-col py-2">
              {tabs.map((tab) => {
                const isActive = isTabActive(tab.href);
                return (
                  <Link
                    key={tab.label}
                    href={tab.href ?? "#"}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "bg-cyan-100 text-cyan-700"
                        : "text-[#0a0e17] hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}