// "use client";
// import React from 'react'
// import { motion } from "framer-motion";

// interface SlideInBannerProps {
//     text?: string;
//     Image?: string;
//   }
  
//   export default function Slider({
//     text = "!!!",
//   }: SlideInBannerProps) {
//     return (
//       <div
//         className="fixed top-9 left-0 right-0 md:hidden flex items-center 
//         min-h-12 px-5 m-1 justify-center rounded-md shadow-xl bg-transparent overflow-hidden"
//       >
//         <motion.p
//           initial={{ x: -60, opacity: 0 }}
//           animate={{ x: 0, opacity: 1 }}
//           transition={{ delay: 3, duration: 0.6, loop:Infinity, ease: "easeOut" }}
//           className="font-poppins font-bold text-cyan-800 pb-2"
//         >
//           {text}
//         </motion.p>
//       </div>
//     );
//   }
// "use client";

// import { motion } from "framer-motion";

// interface SlideInBannerProps {
//   messages?: string[];
// }

// export default function Slider({
//   messages = ["!!!", "Welcome back", "Enjoy your visit"],
// }: SlideInBannerProps) {
//   return (
//     <div
//       className="fixed top-9 left-0 right-0 md:hidden flex flex-col items-center 
//       justify-center gap-1 min-h-12 px-5 py-3 m-1 rounded-md shadow-xl bg-transparent overflow-hidden"
//     >
//       {messages.map((text, i) => (
//         <motion.p
//           key={text}
//           initial={{ x: -60, opacity: 0 }}
//           animate={{ x: 0, opacity: 1 }}
//           transition={{
//             delay: 3 + i * 0.6, // each line waits 0.6s after the previous one
//             duration: 0.6,
//             ease: "easeOut",
//           }}
//           className="font-poppins font-bold text-cyan-800 pb-1"
//         >
//           {text}
//         </motion.p>
//       ))}
//     </div>
//   );
// // }
// "use client";

// import { useEffect, useState } from "react";
// import { AnimatePresence, motion } from "framer-motion";

// interface SlideInBannerProps {
//   /** Only renders/animates once this is true */
//   isLoggedIn: boolean;
//   /** Fallback identifier if no display name is available */
//   userId?: string;
//   /** Preferred display name, shown instead of userId when present */
//   userName?: string;
//   /** Extra lines shown after the welcome message */
//   messages?: string[];
// }

// export default function Slider({
//   isLoggedIn,
//   userId,
//   userName,
//   messages = ["Enjoy your visit"],
// }: SlideInBannerProps) {
//   const [show, setShow] = useState(false);

//   useEffect(() => {
//     // Reset if the user logs out / session ends
//     if (!isLoggedIn) {
//       setShow(false);
//       return;
//     }

//     // Wait 3s after successful login before showing the banner
//     const timer = setTimeout(() => setShow(true), 3000);
//     return () => clearTimeout(timer);
//   }, [isLoggedIn]);

//   // Never render anything unless login actually succeeded
//   if (!isLoggedIn) return null;

//   const displayName = userName ?? userId ?? "there";
//   const allMessages = [`Welcome back, ${displayName}!`, ...messages];

//   return (
//     <AnimatePresence>
//       {show && (
//         <div
//           className="fixed top-9 left-0 right-0 md:hidden flex flex-col items-center 
//           justify-center gap-1 min-h-12 px-5 py-3 m-1 rounded-md shadow-xl bg-transparent overflow-hidden"
//         >
//           {allMessages.map((text, i) => (
//             <motion.p
//               key={text}
//               initial={{ x: -60, opacity: 0 }}
//               animate={{ x: 0, opacity: 1 }}
//               exit={{ x: -60, opacity: 0 }}
//               transition={{
//                 delay: i * 0.6, // each line follows the previous one
//                 duration: 0.6,
//                 ease: "easeOut",
//               }}
//               className="font-poppins font-bold text-cyan-800 pb-1"
//             >
//               {text}
//             </motion.p>
//           ))}
//         </div>
//       )}
//     </AnimatePresence>
//   );
// }





"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";

// ---- Slide components -----------------------------------------------------

const One = () => (
  <div className="fixed left-0 right-0 top-9 m-1 flex h-3 w-auto rounded-md bg-red-400 p-5 shadow-xl md:hidden" />
);

const Two = () => (
  <div className="fixed left-0 right-0 top-9 m-1 flex h-3 w-auto rounded-md bg-purple-500/40 p-5 shadow-xl md:hidden" />
);

const Three = () => (
  <div className="fixed left-0 right-0 top-9 m-1 flex h-3 w-auto rounded-md bg-cyan-500/40 p-5 shadow-xl md:hidden" />
);

const Four = () => (
  <div className="fixed left-0 right-0 top-9 m-1 flex h-3 w-auto rounded-md bg-lime-300/60 p-5 shadow-xl md:hidden" />
);

const slides = [
  { id: "One", N: One },
  { id: "Two", N: Two },
  { id: "Three", N: Three },
  { id: "Four", N: Four },
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

export default function Sliderr() {
  const [[index, direction], setSlide] = useState<[number, number]>([0, 1]);
  const [isPaused, setIsPaused] = useState(false);

  const slideCount = slides.length;

  const goTo = useCallback(
    (nextIndex: number, dir: number) => {
      const wrapped = ((nextIndex % slideCount) + slideCount) % slideCount;
      setSlide([wrapped, dir]);
    },
    [slideCount]
  );

  const next = useCallback(() => goTo(index + 1, 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1, -1), [goTo, index]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [next, isPaused]);

  const ActiveSlide = slides[index].N;

  return (
    <div
      className="relative hidden w-auto overflow-hidden lg:block"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={slides[index].id}
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
    </div>
  );
}
