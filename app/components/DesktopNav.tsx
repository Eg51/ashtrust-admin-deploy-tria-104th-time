// "use client";

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import Analytic from '@/app/components/Analytic';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { CiMenuKebab } from "react-icons/ci";
// import { motion, AnimatePresence } from 'framer-motion';
// import { LuLayoutDashboard } from "react-icons/lu";
// import { BiTransfer } from "react-icons/bi";
// import { MdAccountBalance } from "react-icons/md";
// import { IoIosContact } from "react-icons/io";
// import { CiCreditCard2 } from "react-icons/ci";
// import { X } from 'lucide-react';
// import {
//   FaShieldAlt,
//   FaUsers,
//   FaChartBar,
//   FaCog,
//   FaUserShield,
// } from "react-icons/fa";

// // ---- Types ----------------------------------------------------------------

// interface Tab {
//   name: string;
//   href: string; // placeholder, will be overridden for "Users"
//   icon: React.ComponentType<{ className?: string }>;
// }

// interface UserProfile {
//   _id: string;
//   firstName: string;
//   lastName: string;
//   username: string;
//   displayName: string;
//   email: string;
//   role: string;
//   isAdmin: boolean;
//   isActive: boolean;
// }

// // ---- Constants ------------------------------------------------------------

// // Regular user tabs
// const USER_TABS: Tab[] = [
//   { name: "Dashboard", href: "/Dashboard", icon: LuLayoutDashboard },
//   { name: "Cards", href: "/Cards", icon: CiCreditCard2 },
//   { name: "Buy", href: "/Buy", icon: BiTransfer },
//   { name: "Bills", href: "/Bills", icon: MdAccountBalance },
//   { name: "Settings", href: "/Settings", icon: IoIosContact },
// ];

// // Admin-only tabs – "Users" href is a placeholder
// const ADMIN_TABS: Tab[] = [
//   { name: "Admin", href: "/me", icon: FaShieldAlt },
//   { name: "Users", href: "/me/users/[userId]", icon: FaUsers }, // placeholder
//   { name: "Analytics", href: "/me/analytics", icon: FaChartBar },
//   { name: "Admin Settings", href: "/me/settings", icon: FaCog },
// ];

// // ---- Animation Variants ----------------------------------------------------

// const menuVariants = {
//   closed: {
//     x: '-100%',
//     transition: {
//       type: 'spring' as const,
//       stiffness: 400,
//       damping: 40,
//     },
//   },
//   open: {
//     x: 0,
//     transition: {
//       type: 'spring' as const,
//       stiffness: 400,
//       damping: 40,
//       staggerChildren: 0.05,
//     },
//   },
// };

// const itemVariants = {
//   closed: { opacity: 0, x: -20 },
//   open: { opacity: 1, x: 0 },
// };

// const overlayVariants = {
//   closed: { opacity: 0 },
//   open: { opacity: 1 },
// };

// // ---- Component ------------------------------------------------------------

// export default function DesktopNav() {
//   const pathname = usePathname();
//   const [isOpen, setIsOpen] = useState<boolean>(false);
//   const [isDesktop, setIsDesktop] = useState<boolean>(true);
//   const [isMounted, setIsMounted] = useState<boolean>(false);
//   const [user, setUser] = useState<UserProfile | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const menuRef = useRef<HTMLDivElement>(null);

//   // ---- Effects --------------------------------------------------------------

//   // Handle hydration and user detection
//   useEffect(() => {
//     setIsMounted(true);

//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       try {
//         const parsedUser = JSON.parse(storedUser);
//         setUser(parsedUser);
//       } catch (error) {
//         console.error('Error parsing user data:', error);
//       }
//     }
//     setIsLoading(false);
//   }, []);

//   // Check screen size
//   useEffect(() => {
//     if (!isMounted) return;

//     const checkScreenSize = (): void => {
//       setIsDesktop(window.innerWidth >= 1024);
//     };

//     checkScreenSize();
//     window.addEventListener('resize', checkScreenSize);

//     return () => window.removeEventListener('resize', checkScreenSize);
//   }, [isMounted]);

//   // Close menu when clicking outside
//   useEffect(() => {
//     if (!isMounted) return;

//     const handleClickOutside = (event: MouseEvent): void => {
//       if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     };

//     if (isOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//     }

//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [isOpen, isMounted]);

//   // Close menu on route change
//   useEffect(() => {
//     setIsOpen(false);
//   }, [pathname]);

//   // ---- Handlers -------------------------------------------------------------

//   const toggleMenu = useCallback((): void => {
//     setIsOpen((prev) => !prev);
//   }, []);

//   const closeMenu = useCallback((): void => {
//     setIsOpen(false);
//   }, []);

//   // Check if user is admin
//   const isAdmin = user?.isAdmin === true || user?.role === 'admin';

//   // ---- RENDER BUILD LOGIC ---------------------------------------------------

//   let tabsToRender: Tab[] = [];
//   let adminBadge = null;

//   if (isAdmin) {
//     tabsToRender = ADMIN_TABS;
//     adminBadge = (
//       <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700">
//         <FaUserShield className="h-3 w-3" />
//         Admin
//       </span>
//     );
//   } else {
//     tabsToRender = USER_TABS;
//   }

//   // ---- Footer – make it clickable -------------------------------------------

//   const renderUserInfoFooter = () => {
//     if (isLoading) return null;

//     // Build the dynamic profile URL
//     const profileHref = user?._id ? `/me/users/${user._id}` : "/me/users";

//     return (
//       <Link href={profileHref} onClick={closeMenu}>
//         <div className="border-t border-cyan-200/30 px-6 py-4 cursor-pointer hover:bg-cyan-100/30 transition-colors">
//           <div className="flex items-center gap-3">
//             <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-600 text-white">
//               <span className="text-sm font-bold">
//                 {user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}
//               </span>
//             </div>
//             <div className="flex-1">
//               <h2 className="text-xl font-bold text-cyan-900">
//                 {user?.displayName || user?.username || 'User'}
//               </h2>
//               {isAdmin && (
//                 <p className="text-xs text-amber-700">Administrator</p>
//               )}
//             </div>
//           </div>
//         </div>
//       </Link>
//     );
//   };

//   // ---- Render ---------------------------------------------------------------

//   // Don't render during SSR to avoid hydration mismatch
//   if (!isMounted || isLoading) {
//     return (
//       <div className="fixed top-4 left-4 z-50">
//         <button className="flex items-center gap-2 rounded-xl bg-none font-bold text-md text-cyan-600">
//           <CiMenuKebab className="ml-9em cursor-pointer text-[30px] text-cyan-900 font-black" />
//         </button>
//       </div>
//     );
//   }

//   // Don't render on mobile
//   if (!isDesktop) {
//     return null;
//   }

//   return (
//     <>
//       {/* Hamburger Button */}
//       <div className="fixed top-4 left-4 z-50">
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={toggleMenu}
//           className="flex items-center gap-2 rounded-xl bg-none font-bold text-md text-cyan-600 shadow-cyan-500/30 hover:text-slate-600 transition-all"
//           aria-label={isOpen ? "Close menu" : "Open menu"}
//         >
//           {isOpen ? (
//             <>
//               <X size={20} />
//               <span className="text-lg text-cyan-900 font-bold">Close</span>
//             </>
//           ) : (
//             <CiMenuKebab className="ml-9em cursor-pointer text-[30px] text-cyan-900 font-black" />
//           )}
//         </motion.button>
//       </div>

//       {/* Overlay */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             variants={overlayVariants}
//             initial="closed"
//             animate="open"
//             exit="closed"
//             className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
//             onClick={closeMenu}
//             aria-hidden="true"
//           />
//         )}
//       </AnimatePresence>

//       {/* Side Menu */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.nav
//             ref={menuRef}
//             variants={menuVariants}
//             initial="closed"
//             animate="open"
//             exit="closed"
//             className="fixed top-0 left-0 z-50 h-full w-64 bg-[#C4F8FD] shadow-xl backdrop-blur-sm"
//             role="navigation"
//             aria-label="Main navigation"
//           >
//             <div className="flex h-full flex-col">
//               {/* Brand / Header */}
//               <div className="border-b border-cyan-200/30 px-6 py-6">
//                 <div className="flex items-center justify-between">
//                   <div>{adminBadge}</div>
//                 </div>
//               </div>

//               {/* Navigation Links */}
//               <div className="flex-1 overflow-y-auto px-4 py-6">
//                 <motion.div className="space-y-1">
//                   {tabsToRender.map((tab) => {
//                     // ---- Build dynamic href for "Users" ----
//                     let href = tab.href;
//                     if (tab.name === "Users") {
//                       href = user?._id ? `/me/users/${user._id}` : "/me/users";
//                     }

//                     // ---- Active state ----
//                     const isActive =
//                       tab.name === "Users"
//                         ? pathname.startsWith("/me/users/") || pathname === "/me/users"
//                         : pathname === tab.href || pathname.startsWith(tab.href + "/");

//                     const Icon = tab.icon;

//                     return (
//                       <motion.div
//                         key={tab.name}
//                         variants={itemVariants}
//                         whileHover={{ x: 4 }}
//                       >
//                         <Link
//                           href={href}
//                           className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
//                             isActive
//                               ? isAdmin
//                                 ? "bg-amber-500/20 text-amber-900 shadow-lg ring-1 ring-amber-500/50"
//                                 : "bg-cyan-500/30 text-cyan-900 shadow-lg ring-1 ring-cyan-500/50"
//                               : isAdmin
//                                 ? "text-amber-800 hover:bg-white/30 hover:text-amber-900"
//                                 : "text-cyan-800 hover:bg-white/30 hover:text-cyan-900"
//                           }`}
//                           onClick={closeMenu}
//                           aria-current={isActive ? "page" : undefined}
//                         >
//                           <Icon
//                             className={`text-xl ${
//                               isActive
//                                 ? isAdmin
//                                   ? "text-amber-600"
//                                   : "text-cyan-600"
//                                 : isAdmin
//                                   ? "text-amber-700"
//                                   : "text-cyan-700"
//                             }`}
//                           />
//                           <span className="text-sm font-medium">{tab.name}</span>
//                           {isAdmin && (
//                             <span className="ml-auto rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-semibold text-amber-700">
//                               Admin
//                             </span>
//                           )}
//                           {isActive && (
//                             <motion.div
//                               layoutId="activeIndicator"
//                               className={`ml-auto h-2 w-2 rounded-full ${
//                                 isAdmin ? "bg-amber-500" : "bg-cyan-500"
//                               }`}
//                               transition={{
//                                 type: 'spring',
//                                 stiffness: 300,
//                                 damping: 30,
//                               }}
//                             />
//                           )}
//                         </Link>
//                       </motion.div>
//                     );
//                   })}
//                 </motion.div>
//               </div>

//               {/* Footer - User Info (now clickable) */}
//               {renderUserInfoFooter()}
//               <Analytic />
//             </div>
//           </motion.nav>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }

// "use client";

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import Analytic from '@/app/components/Analytic';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { CiMenuKebab } from "react-icons/ci";
// import { motion, AnimatePresence } from 'framer-motion';
// import { LuLayoutDashboard } from "react-icons/lu";
// import { BiTransfer } from "react-icons/bi";
// import { MdAccountBalance } from "react-icons/md";
// import { IoIosContact } from "react-icons/io";
// import { CiCreditCard2 } from "react-icons/ci";
// import { X, Activity, Zap } from 'lucide-react';
// import {
//   FaShieldAlt,
//   FaUsers,
//   FaChartBar,
//   FaCog,
//   FaUserShield,
// } from "react-icons/fa";

// // ---- Types ----------------------------------------------------------------

// interface Tab {
//   name: string;
//   href: string;         // route OR #section-id
//   icon: React.ComponentType<{ className?: string }>;
//   isSection?: boolean;  // true → smooth-scroll to href instead of navigating
// }

// interface UserProfile {
//   _id: string;
//   firstName: string;
//   lastName: string;
//   username: string;
//   displayName: string;
//   email: string;
//   role: string;
//   isAdmin: boolean;
//   isActive: boolean;
// }

// // ---- Constants ------------------------------------------------------------

// // Regular user tabs
// const USER_TABS: Tab[] = [
//   { name: "Dashboard", href: "/Dashboard", icon: LuLayoutDashboard },
//   { name: "Cards", href: "/Cards", icon: CiCreditCard2 },
//   { name: "Buy", href: "/Buy", icon: BiTransfer },
//   { name: "Bills", href: "/Bills", icon: MdAccountBalance },
//   { name: "Settings", href: "/Settings", icon: IoIosContact },
// ];

// // Admin-only tabs (used on non-/me pages) – "Users" href is a placeholder
// const ADMIN_TABS: Tab[] = [
//   { name: "Admin", href: "/me", icon: FaShieldAlt },
//   { name: "Users", href: "/me/users/[userId]", icon: FaUsers },
//   { name: "Analytics", href: "/me/analytics", icon: FaChartBar },
//   { name: "Admin Settings", href: "/me/settings", icon: FaCog },
// ];

// // Admin section tabs — used ONLY on /me, scroll-jump within the page
// const ADMIN_SECTION_TABS: Tab[] = [
//   { name: "Overview",     href: "#admin-overview",     icon: LuLayoutDashboard, isSection: true },
//   { name: "Users",        href: "#admin-users",        icon: FaUsers,           isSection: true },
//   { name: "Activity",     href: "#admin-activity",     icon: Activity as unknown as React.ComponentType<{ className?: string }>, isSection: true },
//   { name: "Auto-Balance", href: "#admin-auto-balance", icon: Zap as unknown as React.ComponentType<{ className?: string }>, isSection: true },
//   { name: "Requests",     href: "#admin-withdrawals",  icon: MdAccountBalance,  isSection: true },
// ];

// // ---- Animation Variants ---------------------------------------------------

// const menuVariants = {
//   closed: {
//     x: '-100%',
//     transition: { type: 'spring' as const, stiffness: 400, damping: 40 },
//   },
//   open: {
//     x: 0,
//     transition: { type: 'spring' as const, stiffness: 400, damping: 40, staggerChildren: 0.05 },
//   },
// };

// const itemVariants = {
//   closed: { opacity: 0, x: -20 },
//   open:   { opacity: 1, x: 0 },
// };

// const overlayVariants = {
//   closed: { opacity: 0 },
//   open:   { opacity: 1 },
// };

// // ---- Component ------------------------------------------------------------

// export default function DesktopNav() {
//   const pathname = usePathname();
//   const [isOpen, setIsOpen] = useState<boolean>(false);
//   const [isDesktop, setIsDesktop] = useState<boolean>(true);
//   const [isMounted, setIsMounted] = useState<boolean>(false);
//   const [user, setUser] = useState<UserProfile | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const menuRef = useRef<HTMLDivElement>(null);

//   // ---- Effects ------------------------------------------------------------

//   // Hydration + user detection
//   useEffect(() => {
//     setIsMounted(true);
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       try {
//         setUser(JSON.parse(storedUser));
//       } catch (error) {
//         console.error('Error parsing user data:', error);
//       }
//     }
//     setIsLoading(false);
//   }, []);

//   // Screen size
//   useEffect(() => {
//     if (!isMounted) return;
//     const checkScreenSize = (): void => {
//       setIsDesktop(window.innerWidth >= 1024);
//     };
//     checkScreenSize();
//     window.addEventListener('resize', checkScreenSize);
//     return () => window.removeEventListener('resize', checkScreenSize);
//   }, [isMounted]);

//   // Click outside to close
//   useEffect(() => {
//     if (!isMounted) return;
//     const handleClickOutside = (event: MouseEvent): void => {
//       if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     };
//     if (isOpen) document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [isOpen, isMounted]);

//   // Close on route change (only when pathname actually changes)
//   useEffect(() => {
//     setIsOpen(false);
//   }, [pathname]);

//   // ---- Handlers -----------------------------------------------------------

//   const toggleMenu = useCallback((): void => setIsOpen((p) => !p), []);
//   const closeMenu = useCallback((): void => setIsOpen(false), []);

//   const handleSectionClick = (e: React.MouseEvent, href: string) => {
//     e.preventDefault();
//     const id = href.replace('#', '');
//     const el = document.getElementById(id);
//     if (el) {
//       el.scrollIntoView({ behavior: 'smooth', block: 'start' });
//       window.history.replaceState(null, '', href);
//     }
//     closeMenu();
//   };

//   // ---- Derived ------------------------------------------------------------

//   const isAdmin = user?.isAdmin === true || user?.role === 'admin';
//   const isOnAdminPage = pathname?.startsWith('/me') || false;

//   // Which tabs to show
//   let tabsToRender: Tab[] = [];
//   let adminBadge = null;

//   if (isOnAdminPage) {
//     tabsToRender = ADMIN_SECTION_TABS;
//     adminBadge = (
//       <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700">
//         <FaUserShield className="h-3 w-3" />
//         Admin
//       </span>
//     );
//   } else if (isAdmin) {
//     tabsToRender = ADMIN_TABS;
//     adminBadge = (
//       <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700">
//         <FaUserShield className="h-3 w-3" />
//         Admin
//       </span>
//     );
//   } else {
//     tabsToRender = USER_TABS;
//   }

//   // ---- Footer (user info) -------------------------------------------------

//   const renderUserInfoFooter = () => {
//     if (isLoading) return null;

//     const profileHref = user?._id ? `/me/users/${user._id}` : "/me/users";

//     return (
//       <Link href={profileHref} onClick={closeMenu}>
//         <div className="border-t border-cyan-200/30 px-6 py-4 cursor-pointer hover:bg-cyan-100/30 transition-colors">
//           <div className="flex items-center gap-3">
//             <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-600 text-white">
//               <span className="text-sm font-bold">
//                 {user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}
//               </span>
//             </div>
//             <div className="flex-1">
//               <h2 className="text-xl font-bold text-cyan-900">
//                 {user?.displayName || user?.username || 'User'}
//               </h2>
//               {isAdmin && (
//                 <p className="text-xs text-amber-700">Administrator</p>
//               )}
//             </div>
//           </div>
//         </div>
//       </Link>
//     );
//   };

//   // ---- Render -------------------------------------------------------------

//   // SSR / loading placeholder
//   if (!isMounted || isLoading) {
//     return (
//       <div className="fixed top-4 left-4 z-50">
//         <button className="flex items-center gap-2 rounded-xl bg-none font-bold text-md text-cyan-600">
//           <CiMenuKebab className="ml-9em cursor-pointer text-[30px] text-cyan-900 font-black" />
//         </button>
//       </div>
//     );
//   }

//   // Hide on mobile/tablet — Iconpack handles < lg
//   if (!isDesktop) {
//     return null;
//   }

//   return (
//     <>
//       {/* Hamburger Button */}
//       <div className="fixed top-4 left-4 z-50">
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={toggleMenu}
//           className="flex items-center gap-2 rounded-xl bg-none font-bold text-md text-cyan-600 shadow-cyan-500/30 hover:text-slate-600 transition-all"
//           aria-label={isOpen ? "Close menu" : "Open menu"}
//         >
//           {isOpen ? (
//             <>
//               <X size={20} />
//               <span className="text-lg text-cyan-900 font-bold">Close</span>
//             </>
//           ) : (
//             <CiMenuKebab className="ml-9em cursor-pointer text-[30px] text-cyan-900 font-black" />
//           )}
//         </motion.button>
//       </div>

//       {/* Overlay */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             variants={overlayVariants}
//             initial="closed"
//             animate="open"
//             exit="closed"
//             className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
//             onClick={closeMenu}
//             aria-hidden="true"
//           />
//         )}
//       </AnimatePresence>

//       {/* Side Menu */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.nav
//             ref={menuRef}
//             variants={menuVariants}
//             initial="closed"
//             animate="open"
//             exit="closed"
//             className="fixed top-0 left-0 z-50 h-full w-64 bg-[#C4F8FD] shadow-xl backdrop-blur-sm"
//             role="navigation"
//             aria-label="Main navigation"
//           >
//             <div className="flex h-full flex-col">
//               {/* Brand / Header */}
//               <div className="border-b border-cyan-200/30 px-6 py-6">
//                 <div className="flex items-center justify-between">
//                   <div>{adminBadge}</div>
//                 </div>
//               </div>

//               {/* Navigation Links */}
//               <div className="flex-1 overflow-y-auto px-4 py-6">
//                 <motion.div className="space-y-1">
//                   {tabsToRender.map((tab) => {
//                     // Resolve href for the non-section "Users" tab (admin pages elsewhere)
//                     let href = tab.href;
//                     if (!tab.isSection && tab.name === "Users" && isAdmin) {
//                       href = user?._id ? `/me/users/${user._id}` : "/me/users";
//                     }

//                     // Active state — sections don't have an active route
//                     const isActive =
//                       tab.isSection
//                         ? false
//                         : (tab.name === "Users" && isAdmin)
//                           ? pathname.startsWith("/me/users/") || pathname === "/me/users"
//                           : pathname === tab.href || pathname.startsWith(tab.href + "/");

//                     const Icon = tab.icon;

//                     const itemClass = `flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
//                       isActive
//                         ? isAdmin
//                           ? "bg-amber-500/20 text-amber-900 shadow-lg ring-1 ring-amber-500/50"
//                           : "bg-cyan-500/30 text-cyan-900 shadow-lg ring-1 ring-cyan-500/50"
//                         : isAdmin
//                           ? "text-amber-800 hover:bg-white/30 hover:text-amber-900"
//                           : "text-cyan-800 hover:bg-white/30 hover:text-cyan-900"
//                     }`;

//                     // ---- Section item (scroll-jump) ----
//                     if (tab.isSection) {
//                       return (
//                         <motion.div
//                           key={tab.name}
//                           variants={itemVariants}
//                           whileHover={{ x: 4 }}
//                         >
//                           <button
//                             onClick={(e) => handleSectionClick(e, href)}
//                             className={`${itemClass} w-full text-left`}
//                           >
//                             <Icon
//                               className={`text-xl ${
//                                 isAdmin ? "text-amber-700" : "text-cyan-700"
//                               }`}
//                             />
//                             <span className="text-sm font-medium">{tab.name}</span>
//                             <span className="ml-auto rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-semibold text-amber-700">
//                               Admin
//                             </span>
//                           </button>
//                         </motion.div>
//                       );
//                     }

//                     // ---- Route item (normal Link) ----
//                     return (
//                       <motion.div
//                         key={tab.name}
//                         variants={itemVariants}
//                         whileHover={{ x: 4 }}
//                       >
//                         <Link
//                           href={href}
//                           className={itemClass}
//                           onClick={closeMenu}
//                           aria-current={isActive ? "page" : undefined}
//                         >
//                           <Icon
//                             className={`text-xl ${
//                               isActive
//                                 ? isAdmin
//                                   ? "text-amber-600"
//                                   : "text-cyan-600"
//                                 : isAdmin
//                                   ? "text-amber-700"
//                                   : "text-cyan-700"
//                             }`}
//                           />
//                           <span className="text-sm font-medium">{tab.name}</span>
//                           {isAdmin && (
//                             <span className="ml-auto rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-semibold text-amber-700">
//                               Admin
//                             </span>
//                           )}
//                           {isActive && (
//                             <motion.div
//                               layoutId="activeIndicator"
//                               className={`ml-auto h-2 w-2 rounded-full ${
//                                 isAdmin ? "bg-amber-500" : "bg-cyan-500"
//                               }`}
//                               transition={{ type: 'spring', stiffness: 300, damping: 30 }}
//                             />
//                           )}
//                         </Link>
//                       </motion.div>
//                     );
//                   })}
//                 </motion.div>
//               </div>

//               {/* Footer — user info */}
//               {renderUserInfoFooter()}

//               {/* Analytic — hidden on /me to avoid duplicating the header widget */}
//               {!isOnAdminPage && <Analytic />}
//             </div>
//           </motion.nav>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }

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
import { X, Activity, Zap, LogOut, RefreshCw } from 'lucide-react';
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
  href: string;         // route OR #section-id
  icon: React.ComponentType<{ className?: string }>;
  isSection?: boolean;  // true → smooth-scroll to href instead of navigating
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

// Admin-only tabs (used on non-/me pages)
const ADMIN_TABS: Tab[] = [
  { name: "Admin", href: "/me", icon: FaShieldAlt },
  { name: "Users", href: "/me/users/[userId]", icon: FaUsers },
  { name: "Analytics", href: "/me/analytics", icon: FaChartBar },
  { name: "Admin Settings", href: "/me/settings", icon: FaCog },
];

// Admin section tabs — used ONLY on /me, scroll-jump within the page
const ADMIN_SECTION_TABS: Tab[] = [
  { name: "Overview",     href: "#admin-overview",     icon: LuLayoutDashboard, isSection: true },
  { name: "Users",        href: "#admin-users",        icon: FaUsers,           isSection: true },
  { name: "Activity",     href: "#admin-activity",     icon: Activity as unknown as React.ComponentType<{ className?: string }>, isSection: true },
  { name: "Auto-Balance", href: "#admin-auto-balance", icon: Zap as unknown as React.ComponentType<{ className?: string }>, isSection: true },
  { name: "Requests",     href: "#admin-withdrawals",  icon: MdAccountBalance,  isSection: true },
];

// ---- Animation Variants ---------------------------------------------------

const menuVariants = {
  closed: {
    x: '-100%',
    transition: { type: 'spring' as const, stiffness: 400, damping: 40 },
  },
  open: {
    x: 0,
    transition: { type: 'spring' as const, stiffness: 400, damping: 40, staggerChildren: 0.05 },
  },
};

const itemVariants = {
  closed: { opacity: 0, x: -20 },
  open:   { opacity: 1, x: 0 },
};

const overlayVariants = {
  closed: { opacity: 0 },
  open:   { opacity: 1 },
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

  // ---- Effects ------------------------------------------------------------

  // Hydration + user detection
  useEffect(() => {
    setIsMounted(true);
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Screen size — desktop breakpoint at 1024px (matches Iconpack's lg:hidden)
  useEffect(() => {
    if (!isMounted) return;
    const checkScreenSize = (): void => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [isMounted]);

  // Click outside to close
  useEffect(() => {
    if (!isMounted) return;
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMounted]);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // ---- Handlers -----------------------------------------------------------

  const toggleMenu = useCallback((): void => setIsOpen((p) => !p), []);
  const closeMenu = useCallback((): void => setIsOpen(false), []);

  const handleLogout = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ everywhere: false }),
        credentials: 'include',
      });
    } catch {
      // best-effort — clear client state anyway
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/log-in';
  };

  const handleRefresh = (): void => {
    // Ask AdminDashboard to refetch its data
    window.dispatchEvent(new CustomEvent('admin:refresh'));
    closeMenu();
  };

  const handleSectionClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', href);
    }
    closeMenu();
  };

  // ---- Derived ------------------------------------------------------------

  const isAdmin = user?.isAdmin === true || user?.role === 'admin';
  const isOnAdminPage = pathname?.startsWith('/me') || false;

  // Which tabs to show
  let tabsToRender: Tab[] = [];
  let adminBadge = null;

  if (isOnAdminPage) {
    tabsToRender = ADMIN_SECTION_TABS;
    adminBadge = (
      <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700">
        <FaUserShield className="h-3 w-3" />
        Admin
      </span>
    );
  } else if (isAdmin) {
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

  // ---- Footer (user info) -------------------------------------------------

  const renderUserInfoFooter = () => {
    if (isLoading) return null;

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

  // ---- Render -------------------------------------------------------------

  // SSR / loading placeholder
  if (!isMounted || isLoading) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <button className="flex items-center gap-2 rounded-xl bg-none font-bold text-md text-cyan-600">
          <CiMenuKebab className="ml-9em cursor-pointer text-[30px] text-cyan-900 font-black" />
        </button>
      </div>
    );
  }

  // Hide on mobile/tablet — Iconpack handles < lg
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

              {/* Actions — shown on /me only */}
              {isOnAdminPage && (
                <div className="border-b border-cyan-200/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    {/* <button
                      onClick={handleLogout}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/70 px-3 py-2 text-xs font-semibold text-cyan-700 shadow-sm transition-all hover:bg-white hover:text-cyan-900"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Log out
                    </button> */}
                     <div className="flex items-center gap-3">
                        <Analytic />
                      </div>                    
                    <button
                      onClick={handleRefresh}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-cyan-600/20 px-3 py-2 text-xs font-semibold text-cyan-700 shadow-sm transition-all hover:bg-cyan-600/30"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Refresh
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto px-4 py-6">
                <motion.div className="space-y-1">
                  {tabsToRender.map((tab) => {
                    let href = tab.href;
                    if (!tab.isSection && tab.name === "Users" && isAdmin) {
                      href = user?._id ? `/me/users/${user._id}` : "/me/users";
                    }

                    const isActive =
                      tab.isSection
                        ? false
                        : (tab.name === "Users" && isAdmin)
                          ? pathname.startsWith("/me/users/") || pathname === "/me/users"
                          : pathname === tab.href || pathname.startsWith(tab.href + "/");

                    const Icon = tab.icon;

                    const itemClass = `flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                      isActive
                        ? isAdmin
                          ? "bg-amber-500/20 text-amber-900 shadow-lg ring-1 ring-amber-500/50"
                          : "bg-cyan-500/30 text-cyan-900 shadow-lg ring-1 ring-cyan-500/50"
                        : isAdmin
                          ? "text-amber-800 hover:bg-white/30 hover:text-amber-900"
                          : "text-cyan-800 hover:bg-white/30 hover:text-cyan-900"
                    }`;

                    // Section item (scroll-jump)
                    if (tab.isSection) {
                      return (
                        <motion.div
                          key={tab.name}
                          variants={itemVariants}
                          whileHover={{ x: 4 }}
                        >
                          <button
                            onClick={(e) => handleSectionClick(e, href)}
                            className={`${itemClass} w-full text-left`}
                          >
                            <Icon
                              className={`text-xl ${
                                isAdmin ? "text-amber-700" : "text-cyan-700"
                              }`}
                            />
                            <span className="text-sm font-medium">{tab.name}</span>
                            <span className="ml-auto rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-semibold text-amber-700">
                              Admin
                            </span>
                          </button>
                        </motion.div>
                      );
                    }

                    // Route item (normal Link)
                    return (
                      <motion.div
                        key={tab.name}
                        variants={itemVariants}
                        whileHover={{ x: 4 }}
                      >
                        <Link
                          href={href}
                          className={itemClass}
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
                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>

              {/* Footer — user info */}
              {renderUserInfoFooter()}

              {/* Analytic — hidden on /me to avoid duplicating the header widget */}
              {!isOnAdminPage && <Analytic />}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}