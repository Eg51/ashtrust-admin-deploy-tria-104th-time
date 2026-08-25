"use client";

import { useState } from "react";
import Link from "next/link";

// ---- Data ---------------------------------------------------------------

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Personal", href: "#" },
  { label: "Business", href: "#" },
  { label: "Investment", href: "#" },
];

// ---- Component ------------------------------------------------------------

export default function Headerr() {
  const [active, setActive] = useState<string>("Business");

  return (
    <header className="w-full border-b border-white/10 bg-[#0b0f17]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        {/* Logo */}
        <Link href="/" className="text-base font-bold text-white">
          Lumina <span className="text-cyan-400">Bank</span>
        </Link>

        {/* Tabs */}
        <nav
          role="tablist"
          aria-label="Primary navigation"
          className="hidden items-center gap-2 sm:flex"
        >
          {navItems.map((item) => {
            const isActive = item.label === active;
            return (
              <Link
                key={item.label}
                href={item.href}
                role="tab"
                aria-selected={isActive}
                onClick={(e) => {
                  if (item.href === "#") e.preventDefault();
                  setActive(item.label);
                }}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-dashed border-white/60 text-white"
                    : "border-transparent text-slate-300 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth actions */}
        <div className="flex items-center gap-3">
          <Link
            href="#"
            className="rounded-md border border-dashed border-white/40 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:border-white/70"
          >
            Log In
          </Link>
          <Link
            href="#"
            className="rounded-md border border-cyan-400 px-4 py-1.5 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-400/10"
          >
            Open Account
          </Link>
        </div>
      </div>
    </header>
  );
}
