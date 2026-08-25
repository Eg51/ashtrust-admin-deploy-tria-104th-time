// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { motion, type Variants } from "framer-motion";
// import {
//   ArrowRight,
//   User,
//   Lock,
//   ShieldCheck,
//   TrendingUp,
//   Globe,
// } from "lucide-react";
// import GrowthToolsCTA from "./GrowthToolsCTA";

// // ---- Data ---------------------------------------------------------------

// const securityFeatures = [
//   {
//     icon: ShieldCheck,
//     title: "Military-Grade Encryption",
//     description:
//       "End-to-end multi-layer security protocols protecting every transaction and asset.",
//   },
//   {
//     icon: TrendingUp,
//     title: "Predictive Analytics",
//     description:
//       "AI-driven insights to help you optimize your portfolio and capital allocation.",
//   },
//   {
//     icon: Globe,
//     title: "Global Connectivity",
//     description:
//       "Move capital across borders with zero-latency execution and real-time conversion.",
//   },
// ];

// const footerLinks = [
//   { label: "Privacy Policy", href: "#" },
//   { label: "Security Audit", href: "#" },
//   { label: "Legal", href: "#" },
// ];

// // ---- Animation variants ---------------------------------------------------

// const navVariants: Variants = {
//   hidden: { opacity: 0, y: -16 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
// };

// const heroContainer: Variants = {
//   hidden: {},
//   visible: {
//     transition: { staggerChildren: 0.12, delayChildren: 0.1 },
//   },
// };

// const fadeUp: Variants = {
//   hidden: { opacity: 0, y: 24 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
// };

// const cardsContainer: Variants = {
//   hidden: {},
//   visible: {
//     transition: { staggerChildren: 0.15, delayChildren: 0.3 },
//   },
// };

// const cardFade: Variants = {
//   hidden: { opacity: 0, y: 30, scale: 0.97 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     scale: 1,
//     transition: { duration: 0.5, ease: "easeOut" },
//   },
// };

// const gridContainer: Variants = {
//   hidden: {},
//   visible: {
//     transition: { staggerChildren: 0.12 },
//   },
// };

// const gridItem: Variants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
// };

// // ---- Component ------------------------------------------------------------

// export default function AshTrustHero() {
//   return (
//     <section className="w-full min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300
//     rounded-3x1 px-4 pt-8 text-[#0a0e17] sm:px-6 sm:pt-13">
//       <div className="mx-auto max-w-6xl">
        
//         </div>
//     </section>
//   );
// }
