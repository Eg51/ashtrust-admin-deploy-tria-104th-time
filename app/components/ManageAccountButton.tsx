// app/components/ManageAccountButton.tsx
"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Settings, 
  ChevronRight, 
  Building2, 
  Wallet,
  Sparkles
} from "lucide-react";

interface ManageAccountButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
  redirectPath?: string;
  showIcon?: boolean;
  animate?: boolean;
}

export default function ManageAccountButton({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  redirectPath = '/Account',
  showIcon = true,
  animate = true,
}: ManageAccountButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(redirectPath);
  };

  // Size configurations
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5',
  };

  // Variant configurations
  const variantClasses = {
    default: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/40',
    outline: 'border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-600/10',
    ghost: 'text-cyan-600 hover:bg-cyan-600/10',
    premium: 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-lg shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/40',
  };

  // ✅ FIXED: Properly typed animation variants with 'as const'
  const buttonVariants: Variants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.03,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { 
      scale: 0.95,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
  };

  const iconVariants: Variants = {
    initial: { rotate: 0 },
    hover: { 
      rotate: 180,
      transition: { duration: 0.5, ease: "easeInOut" }
    },
  };

  const sparkleVariants: Variants = {
    initial: { opacity: 0, scale: 0 },
    hover: { 
      opacity: [0, 1, 0],
      scale: [0, 1.2, 0],
      transition: { duration: 1, repeat: Infinity }
    },
  };

  const glowVariants: Variants = {
    initial: { opacity: 0.3 },
    hover: { 
      opacity: [0.3, 0.8, 0.3],
      transition: { duration: 1.5, repeat: Infinity }
    },
  };

  // ✅ Determine which icon to show
  const IconComponent = variant === 'premium' ? Wallet : Building2;

  return (
    <motion.button
      variants={animate ? buttonVariants : undefined}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      onClick={handleClick}
      className={`
        inline-flex items-center justify-center
        rounded-xl font-semibold
        transition-all duration-300
        relative overflow-hidden
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {/* Glow effect */}
      {variant === 'premium' && (
        <motion.div
          variants={glowVariants}
          initial="initial"
          animate="hover"
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      )}

      {/* Sparkle effect */}
      {variant === 'premium' && (
        <motion.div
          variants={sparkleVariants}
          initial="initial"
          animate="hover"
          className="absolute -top-1 -right-1"
        >
          <Sparkles className="h-3 w-3 text-yellow-300" />
        </motion.div>
      )}

      {/* Icon */}
      {showIcon && (
        <motion.div
          variants={iconVariants}
          initial="initial"
          whileHover="hover"
          className="flex-shrink-0"
        >
          <IconComponent className="h-4 w-4" />
        </motion.div>
      )}

      {/* Text */}
      <span className="relative z-10">
        {children || (variant === 'premium' ? 'Manage Accounts' : 'Bank Accounts')}
      </span>

      {/* Arrow icon */}
      <motion.div
        initial={{ x: 0 }}
        whileHover={{ x: 4 }}
        className="flex-shrink-0 relative z-10"
      >
        <ChevronRight className="h-4 w-4" />
      </motion.div>
    </motion.button>
  );
}