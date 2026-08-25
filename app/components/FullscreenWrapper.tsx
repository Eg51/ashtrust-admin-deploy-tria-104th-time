// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "./globals.css";
// import FullscreenWrapper from "@/components/FullscreenWrapper";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Lumina Bank",
//   description: "Modern Banking Platform",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <FullscreenWrapper autoEnter={false} showButton={true}>
//           {children}
//         </FullscreenWrapper>
//       </body>
//     </html>
//   );
// }
// app/dashboard/page.tsx



"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

interface FullscreenWrapperProps {
  children: ReactNode;
  autoEnter?: boolean;
  showButton?: boolean;
  buttonPosition?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  buttonVariant?: "default" | "minimal" | "outline";
  className?: string;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export default function FullscreenWrapper({
  children,
  autoEnter = false,
  showButton = true,
  buttonPosition = "bottom-right",
  buttonVariant = "default",
  className = "",
  onFullscreenChange,
}: FullscreenWrapperProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const hasAutoEntered = useRef(false);

  // Check if fullscreen API is supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSupported(!!document.documentElement.requestFullscreen);
    }
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      onFullscreenChange?.(isFull);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, [onFullscreenChange]);

  // Auto-enter fullscreen on mount
  useEffect(() => {
    if (autoEnter && isSupported && !hasAutoEntered.current) {
      const enterFullscreen = async () => {
        try {
          if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
            hasAutoEntered.current = true;
          }
        } catch (error) {
          console.error("Failed to auto-enter fullscreen:", error);
        }
      };

      // Small delay to ensure DOM is fully loaded
      const timer = setTimeout(enterFullscreen, 300);
      return () => clearTimeout(timer);
    }
  }, [autoEnter, isSupported]);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error("Failed to toggle fullscreen:", error);
    }
  };

  // Button position classes
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  // Button variant styles
  const variantClasses = {
    default:
      "bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-600/20",
    minimal:
      "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/10",
    outline:
      "bg-transparent text-slate-700 hover:bg-white/20 border border-slate-200 dark:border-slate-700 dark:text-white",
  };

  // Don't render if not supported (but still show children)
  if (!isSupported) {
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className}`}>
      {children}

      {showButton && (
        <button
          onClick={toggleFullscreen}
          className={`fixed z-50 rounded-lg p-2.5 transition-all duration-200 hover:scale-105 ${positionClasses[buttonPosition]} ${variantClasses[buttonVariant]}`}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-5 w-5" />
          ) : (
            <Maximize2 className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
  );
}