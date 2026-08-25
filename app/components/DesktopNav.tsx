"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Analytic from '@/app/components/Analytic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CiMenuKebab } from "react-icons/ci";
import { motion, AnimatePresence } from 'framer-motion';
import { LuLayoutDashboard } from "react-icons/lu";
import { BiTransfer } from "react-icons/bi";
import { MdAccountBalance } from "react-icons/md";
import { IoIosContact } from "react-icons/io";
import { CiCreditCard2 } from "react-icons/ci";
import { X } from 'lucide-react';
import {
  FaShieldAlt,
  FaUsers,
  FaChartBar,
  FaCog,
  FaUserShield,
} from "react-icons/fa";

// ---- Types ----------------------------------------------------------------

interface Tab {
  name: string;
  href: string; // placeholder, will be overridden for "Users"
  icon: React.ComponentType<{ className?: string }>;
}

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  displayName: string;
  email: string;
  role: string;
  isAdmin: boolean;
  isActive: boolean;
}

// ---- Constants ------------------------------------------------------------

// Regular user tabs
const USER_TABS: Tab[] = [
  { name: "Dashboard", href: "/Dashboard", icon: LuLayoutDashboard },
  { name: "Cards", href: "/Cards", icon: CiCreditCard2 },
  { name: "Buy", href: "/Buy", icon: BiTransfer },
  { name: "Bills", href: "/Bills", icon: MdAccountBalance },
  { name: "Settings", href: "/Settings", icon: IoIosContact },
];

// Admin-only tabs – "Users" href is a placeholder
const ADMIN_TABS: Tab[] = [
  { name: "Admin", href: "/me", icon: FaShieldAlt },
  { name: "Users", href: "/me/users/[userId]", icon: FaUsers }, // placeholder
  { name: "Analytics", href: "/me/analytics", icon: FaChartBar },
  { name: "Admin Settings", href: "/me/settings", icon: FaCog },
];

// ---- Animation Variants ----------------------------------------------------

const menuVariants = {
  closed: {
    x: '-100%',
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 40,
    },
  },
  open: {
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 40,
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  closed: { opacity: 0, x: -20 },
  open: { opacity: 1, x: 0 },
};

const overlayVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
};

// ---- Component ------------------------------------------------------------

export default function DesktopNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const menuRef = useRef<HTMLDivElement>(null);

  // ---- Effects --------------------------------------------------------------

  // Handle hydration and user detection
  useEffect(() => {
    setIsMounted(true);

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Check screen size
  useEffect(() => {
    if (!isMounted) return;

    const checkScreenSize = (): void => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, [isMounted]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isMounted) return;

    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMounted]);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // ---- Handlers -------------------------------------------------------------

  const toggleMenu = useCallback((): void => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback((): void => {
    setIsOpen(false);
  }, []);

  // Check if user is admin
  const isAdmin = user?.isAdmin === true || user?.role === 'admin';

  // ---- RENDER BUILD LOGIC ---------------------------------------------------

  let tabsToRender: Tab[] = [];
  let adminBadge = null;

  if (isAdmin) {
    tabsToRender = ADMIN_TABS;
    adminBadge = (
      <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700">
        <FaUserShield className="h-3 w-3" />
        Admin
      </span>
    );
  } else {
    tabsToRender = USER_TABS;
  }

  // ---- Footer – make it clickable -------------------------------------------

  const renderUserInfoFooter = () => {
    if (isLoading) return null;

    // Build the dynamic profile URL
    const profileHref = user?._id ? `/me/users/${user._id}` : "/me/users";

    return (
      <Link href={profileHref} onClick={closeMenu}>
        <div className="border-t border-cyan-200/30 px-6 py-4 cursor-pointer hover:bg-cyan-100/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-600 text-white">
              <span className="text-sm font-bold">
                {user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-cyan-900">
                {user?.displayName || user?.username || 'User'}
              </h2>
              {isAdmin && (
                <p className="text-xs text-amber-700">Administrator</p>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  };

  // ---- Render ---------------------------------------------------------------

  // Don't render during SSR to avoid hydration mismatch
  if (!isMounted || isLoading) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <button className="flex items-center gap-2 rounded-xl bg-none font-bold text-md text-cyan-600">
          <CiMenuKebab className="ml-9em cursor-pointer text-[30px] text-cyan-900 font-black" />
        </button>
      </div>
    );
  }

  // Don't render on mobile
  if (!isDesktop) {
    return null;
  }

  return (
    <>
      {/* Hamburger Button */}
      <div className="fixed top-4 left-4 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleMenu}
          className="flex items-center gap-2 rounded-xl bg-none font-bold text-md text-cyan-600 shadow-cyan-500/30 hover:text-slate-600 transition-all"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? (
            <>
              <X size={20} />
              <span className="text-lg text-cyan-900 font-bold">Close</span>
            </>
          ) : (
            <CiMenuKebab className="ml-9em cursor-pointer text-[30px] text-cyan-900 font-black" />
          )}
        </motion.button>
      </div>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={closeMenu}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Side Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            ref={menuRef}
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-0 left-0 z-50 h-full w-64 bg-[#C4F8FD] shadow-xl backdrop-blur-sm"
            role="navigation"
            aria-label="Main navigation"
          >
            <div className="flex h-full flex-col">
              {/* Brand / Header */}
              <div className="border-b border-cyan-200/30 px-6 py-6">
                <div className="flex items-center justify-between">
                  <div>{adminBadge}</div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto px-4 py-6">
                <motion.div className="space-y-1">
                  {tabsToRender.map((tab) => {
                    // ---- Build dynamic href for "Users" ----
                    let href = tab.href;
                    if (tab.name === "Users") {
                      href = user?._id ? `/me/users/${user._id}` : "/me/users";
                    }

                    // ---- Active state ----
                    const isActive =
                      tab.name === "Users"
                        ? pathname.startsWith("/me/users/") || pathname === "/me/users"
                        : pathname === tab.href || pathname.startsWith(tab.href + "/");

                    const Icon = tab.icon;

                    return (
                      <motion.div
                        key={tab.name}
                        variants={itemVariants}
                        whileHover={{ x: 4 }}
                      >
                        <Link
                          href={href}
                          className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                            isActive
                              ? isAdmin
                                ? "bg-amber-500/20 text-amber-900 shadow-lg ring-1 ring-amber-500/50"
                                : "bg-cyan-500/30 text-cyan-900 shadow-lg ring-1 ring-cyan-500/50"
                              : isAdmin
                                ? "text-amber-800 hover:bg-white/30 hover:text-amber-900"
                                : "text-cyan-800 hover:bg-white/30 hover:text-cyan-900"
                          }`}
                          onClick={closeMenu}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <Icon
                            className={`text-xl ${
                              isActive
                                ? isAdmin
                                  ? "text-amber-600"
                                  : "text-cyan-600"
                                : isAdmin
                                  ? "text-amber-700"
                                  : "text-cyan-700"
                            }`}
                          />
                          <span className="text-sm font-medium">{tab.name}</span>
                          {isAdmin && (
                            <span className="ml-auto rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-semibold text-amber-700">
                              Admin
                            </span>
                          )}
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className={`ml-auto h-2 w-2 rounded-full ${
                                isAdmin ? "bg-amber-500" : "bg-cyan-500"
                              }`}
                              transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 30,
                              }}
                            />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>

              {/* Footer - User Info (now clickable) */}
              {renderUserInfoFooter()}
              <Analytic />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}