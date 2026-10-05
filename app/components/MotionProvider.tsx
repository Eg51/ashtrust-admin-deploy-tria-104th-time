"use client";

// app/components/MotionProvider.tsx
//
// Wraps the app in Framer Motion's MotionConfig so animations respect
// the user's `prefers-reduced-motion` OS setting.
//
// Without this, every framer-motion component plays its entrance/hover
// animations even for users who have asked the OS to reduce motion
// (WCAG 2.3.3 — Animation from Interactions).

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

interface MotionProviderProps {
  children: ReactNode;
}

export default function MotionProvider({ children }: MotionProviderProps) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}