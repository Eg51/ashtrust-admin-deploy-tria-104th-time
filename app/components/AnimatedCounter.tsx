"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export default function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 1.5,
  className = "",
}: AnimatedCounterProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  const count = useMotionValue(0);
  

  const rounded = useTransform(count, (latest) => 
    Math.round(latest).toLocaleString('en-US') 
  );

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(count, value, {
      duration,
      ease: "easeOut",
    });
    return controls.stop;
  }, [isInView, value, duration, count]);

  return (
    <p ref={ref} className={className}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </p>
  );
}