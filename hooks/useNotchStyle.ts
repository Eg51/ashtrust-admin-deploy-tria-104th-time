"use client";

import { useState, useEffect, useCallback } from "react";

export type NotchStyle = "center" | "left" | "right" | "none";

const STORAGE_KEY = "ashtrust:notch-style";
const VALID: NotchStyle[] = ["center", "left", "right", "none"];

function isValid(v: unknown): v is NotchStyle {
  return typeof v === "string" && (VALID as string[]).includes(v);
}

/**
 * Auto-guess the notch style from screen shape.
 *
 * Browser APIs can't tell us where the camera physically sits, so this
 * is a best-effort default:
 *   - Wide viewport (>= 1024px)         → "none"   (desktop, no notch)
 *   - Narrow viewport with a notch inset → "center" (iOS-style camera)
 *   - Narrow viewport, no notch inset    → "none"   (older phone, punch-hole)
 *
 * Admin can override at any time — the override is stored in localStorage.
 */
function guessNotchStyle(): NotchStyle {
  if (typeof window === "undefined") return "center";

  const wide = window.innerWidth >= 1024;
  if (wide) return "none";

  // Probe env(safe-area-inset-top) by measuring a hidden element
  let hasNotchInset = false;
  try {
    const probe = document.createElement("div");
    probe.style.cssText =
      "position:fixed;top:0;left:0;width:1px;height:1px;" +
      "padding-top:env(safe-area-inset-top);visibility:hidden;pointer-events:none;";
    document.body.appendChild(probe);
    const padding = parseFloat(getComputedStyle(probe).paddingTop || "0");
    hasNotchInset = padding > 0;
    document.body.removeChild(probe);
  } catch {
    hasNotchInset = false;
  }

  return hasNotchInset ? "center" : "none";
}

/**
 * Reads the safe-area-inset-top value in pixels.
 * Returns 0 when there is no inset (desktop, older phones).
 */
export function getSafeAreaTop(): number {
  if (typeof window === "undefined") return 0;
  try {
    const probe = document.createElement("div");
    probe.style.cssText =
      "position:fixed;top:0;left:0;width:1px;height:1px;" +
      "padding-top:env(safe-area-inset-top);visibility:hidden;pointer-events:none;";
    document.body.appendChild(probe);
    const px = parseFloat(getComputedStyle(probe).paddingTop || "0");
    document.body.removeChild(probe);
    return Number.isFinite(px) ? px : 0;
  } catch {
    return 0;
  }
}

export function useNotchStyle() {
  const [style, setStyleState] = useState<NotchStyle>("center");
  const [mounted, setMounted] = useState(false);

  // Load on mount — never runs during SSR
  useEffect(() => {
    setMounted(true);

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isValid(stored)) {
        setStyleState(stored);
        return;
      }
    } catch {
      // ignore storage errors (private mode, etc.)
    }

    setStyleState(guessNotchStyle());
  }, []);

  // Admin override — persists for future visits
  const setStyle = useCallback((next: NotchStyle) => {
    if (!isValid(next)) return;
    setStyleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // silent — the visual change still applies this session
    }
  }, []);

  // Reset back to auto-guess
  const resetToAuto = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setStyleState(guessNotchStyle());
  }, []);

  return { style, setStyle, resetToAuto, mounted };
}