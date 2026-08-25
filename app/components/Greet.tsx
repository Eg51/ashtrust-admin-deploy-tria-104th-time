"use client";

import React, { useEffect, useState } from "react";
import { WiSunrise } from "react-icons/wi";
import { TbSunset2 } from "react-icons/tb";
import { MdSunny } from "react-icons/md";
import { FaMoon } from "react-icons/fa";
import { motion } from "framer-motion";

// ---- Types ----------------------------------------------------------------

interface GreetProps {
  className?: string;
  iconSize?: number;
  showIcon?: boolean;
  username?: string;
}

interface TimeGreeting {
  greeting: string;
  icon: React.ReactNode;
  color: string;
}

// ---- Constants ------------------------------------------------------------

const GREETINGS = {
  MORNING: {
    greeting: "Good Morning",
    icon: <WiSunrise className="text-[20px]" />,
    color: "text-yellow-200",
  },
  AFTERNOON: {
    greeting: "Good Afternoon",
    icon: <MdSunny className="text-[20px]" />,
    color: "text-yellow-500",
  },
  EVENING: {
    greeting: "Good Evening",
    icon: <TbSunset2 className="text-[20px]" />,
    color: "text-orange-400",
  },
  NIGHT: {
    greeting: "Good Evening",
    icon: <FaMoon className="text-[20px]" />,
    color: "text-slate-400",
  },
} as const;

// ---- Helper Functions -----------------------------------------------------

const getTimeBasedGreeting = (): TimeGreeting => {
  const hour = new Date().getHours();
  if (hour >= 1 && hour < 12) return GREETINGS.MORNING;
  if (hour >= 12 && hour < 16) return GREETINGS.AFTERNOON;
  if (hour >= 16 && hour < 19) return GREETINGS.EVENING;
  return GREETINGS.NIGHT;
};

const formatUsername = (name: string): string => {
  if (!name) return "User";
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

// ---- Component ------------------------------------------------------------

export default function Greet({
  className = "",
  iconSize = 44,
  showIcon = true,
}: GreetProps) {
  // HYDRAX FIX: Prevents hydration mismatch. Returns null until client mounts.
  const [mounted, setMounted] = useState(false);
  const [greetingData, setGreetingData] = useState<TimeGreeting>(getTimeBasedGreeting());
  const [displayName, setDisplayName] = useState("User");

  useEffect(() => {
    setMounted(true);
    
    // Fetch user from localStorage safely on the client
    let name = "User";
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        // Priority: displayName -> firstName -> username -> email
        name = parsed.displayName || parsed.firstName || parsed.username || parsed.email?.split("@")[0] || "User";
      }
    } catch (e) {
      console.warn("Could not parse user greeting data");
    }
    setDisplayName(formatUsername(name));
  }, []);

  // Update greeting every minute
  useEffect(() => {
    const updateGreeting = () => setGreetingData(getTimeBasedGreeting());
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Changed to 60s (1 minute) to be efficient
    return () => clearInterval(interval);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } as const,
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -30 },
    visible: { scale: 1, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 20, delay: 0.2 } } as const,
  };

  // 🚨 HYDRATION FIX: Do not render ANY text until client mounts
  if (!mounted) {
    return <div className={`h-8 w-48 animate-pulse rounded bg-[#C4F8FD] ${className}`} />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`flex items-center gap-3 ${className}`}
    >
      {/* Greeting Text */}
      <motion.h1
        className="text-2xl font-bold text-cyan-900 sm:text-3xl"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {greetingData.greeting}{" "}
        <span className="text-cyan-700">{displayName}</span>
      </motion.h1>

      {/* Icon */}
      {showIcon && (
        <motion.span
          variants={iconVariants}
          initial="hidden"
          animate="visible"
          className={`inline-flex ${greetingData.color} transition-colors duration-500`}
          style={{ fontSize: `${iconSize}px` }} // ✅ FIX: `md` moved inside and correctly formatted
        >
          {greetingData.icon}
        </motion.span>
      )}
    </motion.div>
  );
}