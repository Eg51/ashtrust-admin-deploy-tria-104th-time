"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import GrowthToolsCTA from "./GrowthToolsCTA";
import CommercialCapital from "./CommercialCapital";
import TreasuryFeatureGrid from './TreasuryFeatureGrid';

// ---- Data ---------------------------------------------------------------

const slides = [
  { id: "growth", Component: GrowthToolsCTA },
  { id: "capital", Component: CommercialCapital },
  { id: "treasury", Component: TreasuryFeatureGrid },
];

const AUTOPLAY_INTERVAL = 4000;

// ---- Animation variants ----------------------------------------------------

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.99, ease: "easeInOut" },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
    transition: { duration: 0.99, ease: "easeInOut" },
  }),
};

// ---- Component ------------------------------------------------------------

export default function Carousel() {
  const [[index, direction], setSlide] = useState<[number, number]>([0, 1]);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const slideCount = slides.length;

  const goTo = useCallback(
    (nextIndex: number, dir: number) => {
      // Wrap around infinitely in both directions
      const wrapped = ((nextIndex % slideCount) + slideCount) % slideCount;
      setSlide([wrapped, dir]);
    },
    [slideCount]
  );

  const next = useCallback(() => goTo(index + 1, 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1, -1), [goTo, index]);

  // Infinite autoplay loop
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [next, isPaused]);

  const ActiveSlide = slides[index]?.Component;

  // Guard against undefined ActiveSlide
  if (!ActiveSlide) {
    return null;
  }

  return (
    <div
      className="hidden lg:block relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={slides[index]?.id || index}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="w-full"
        >
          <ActiveSlide />
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-6">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i, i > index ? 1 : -1)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-cyan-400" : "w-1.5 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}