// "use client";

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { LuLayoutDashboard } from "react-icons/lu";
// import { BiTransfer } from "react-icons/bi";
// import { MdAccountBalance } from "react-icons/md";
// import { IoIosContact } from "react-icons/io";
// import { CiCreditCard2 } from "react-icons/ci";
// import { HiPlus } from "react-icons/hi";
// import { 
//   FaShieldAlt, 
//   FaUsers, 
//   FaChartBar, 
//   FaCog
// } from "react-icons/fa";

// // ---- Types ----------------------------------------------------------------

// interface Tab {
//   name: string;
//   href: string;          // placeholder; may be overridden for dynamic routes
//   icon: React.ComponentType<{ className?: string }>;
//   isPlus?: boolean;
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
//   { name: "Buy", href: "/Buy", icon: BiTransfer, isPlus: true },
//   { name: "Bills", href: "/Bills", icon: MdAccountBalance },
//   { name: "Settings", href: "/Settings", icon: IoIosContact },
// ];

// // Admin-only tabs – href placeholders (will be resolved at render)
// const ADMIN_TABS: Tab[] = [
//   { name: "Admin", href: "/me", icon: FaShieldAlt },
//   { name: "Users", href: "/me/users", icon: FaUsers },   // base, will be dynamic
//   { name: "Analytics", href: "/me/analytics", icon: FaChartBar },
//   { name: "Settings", href: "/me/settings", icon: FaCog },
// ];

// // ---- Component ------------------------------------------------------------

// const Iconpack = () => {
//   const pathname = usePathname();
//   const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const [user, setUser] = useState<UserProfile | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   // Handle mounting and user detection
//   useEffect(() => {
//     setMounted(true);
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

//   // Keyboard detection effect (unchanged – works fine)
//   useEffect(() => {
//     const detectKeyboard = () => {
//       const activeElement = document.activeElement;
//       const isInputFocused = activeElement?.tagName === 'INPUT' || 
//                              activeElement?.tagName === 'TEXTAREA' || 
//                              activeElement?.getAttribute('contenteditable') === 'true';
//       const windowHeight = window.innerHeight;
//       const screenHeight = window.screen.height;
//       const heightDifference = screenHeight - windowHeight;
//       if (isInputFocused && heightDifference > 150) {
//         setIsKeyboardVisible(true);
//       } else {
//         setIsKeyboardVisible(false);
//       }
//     };

//     detectKeyboard();

//     const handleResize = () => detectKeyboard();
//     const handleFocus = () => setTimeout(detectKeyboard, 100);
//     const handleBlur = () => setTimeout(detectKeyboard, 100);

//     const handleVisualViewportChange = () => {
//       if (window.visualViewport) {
//         const viewportHeight = window.visualViewport.height;
//         const windowHeight = window.innerHeight;
//         const heightDifference = windowHeight - viewportHeight;
//         const activeElement = document.activeElement;
//         const isInputFocused = activeElement?.tagName === 'INPUT' || 
//                                activeElement?.tagName === 'TEXTAREA' || 
//                                activeElement?.getAttribute('contenteditable') === 'true';
//         if (isInputFocused && heightDifference > 150) {
//           setIsKeyboardVisible(true);
//         } else {
//           setIsKeyboardVisible(false);
//         }
//       }
//     };

//     window.addEventListener('resize', handleResize);
//     window.addEventListener('focus', handleFocus, true);
//     window.addEventListener('blur', handleBlur, true);
//     if (window.visualViewport) {
//       window.visualViewport.addEventListener('resize', handleVisualViewportChange);
//     }
//     window.addEventListener('scroll', detectKeyboard);

//     return () => {
//       window.removeEventListener('resize', handleResize);
//       window.removeEventListener('focus', handleFocus, true);
//       window.removeEventListener('blur', handleBlur, true);
//       window.removeEventListener('scroll', detectKeyboard);
//       if (window.visualViewport) {
//         window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
//       }
//     };
//   }, []);

//   const isAdmin = user?.isAdmin === true || user?.role === 'admin';

//   // Choose which tabs to render
//   const tabsToRender = isAdmin ? ADMIN_TABS : USER_TABS;

//   // ---- Helper to resolve dynamic href for "Users" tab ----
//   const resolveHref = (tab: Tab): string => {
//     if (tab.name === "Users" && isAdmin) {
//       // If user._id exists, go to that specific user's profile
//       if (user?._id) {
//         return `/me/users/${user._id}`;
//       }
//       // fallback to the base users list
//       return "/me/users";
//     }
//     return tab.href;
//   };

//   // ---- Helper to check if a tab is active ----
//   const isTabActive = (tab: Tab): boolean => {
//     const href = resolveHref(tab);
//     if (tab.name === "Users" && isAdmin) {
//       // The Users tab is active if we're on any /me/users/... route
//       return pathname.startsWith("/me/users/") || pathname === "/me/users";
//     }
//     // Exact match or starts with (for nested routes like /Dashboard/something)
//     return pathname === href || pathname.startsWith(href + "/");
//   };

//   // ---- Render ----------------------------------------------------------------

//   // SSR / loading fallback (same as before, using USER_TABS for shape)
//   if (!mounted || isLoading) {
//     return (
//       <div className='fixed z-10 bottom-0 left-0 right-0 flex w-full items-center justify-around bg-white/10 px-2 py-2 shadow-xl backdrop-blur-sm md:hidden'>
//         {USER_TABS.map((tab) => {
//           const Icon = tab.icon;
//           if (tab.isPlus) {
//             return (
//               <div key={tab.name} className='flex h-9 w-9 cursor-pointer items-center justify-center m-auto rounded-full bg-none shadow-xl shadow-cyan-600 transition-transform hover:scale-105'>
//                 <HiPlus className='text-[20px] font-black text-cyan-900' />
//               </div>
//             );
//           }
//           return (
//             <div key={tab.name} className='flex flex-col items-center gap-0.5'>
//               <div className='rounded-lg p-2 transition-colors text-cyan-600 hover:text-cyan-400'>
//                 <Icon className='text-xl font-bold text-cyan-900' />
//               </div>
//               <span className='text-[8px] font-medium text-cyan-900'>{tab.name}</span>
//             </div>
//           );
//         })}
//       </div>
//     );
//   }

//   if (isKeyboardVisible) return null;

//   // ---- Main render ----
//   return (
//     <div className='fixed z-10 bottom-0 left-0 right-0 flex w-full items-center justify-around bg-white/10 px-2 py-2 shadow-xl backdrop-blur-sm md:hidden'>
//       {tabsToRender.map((tab) => {
//         const href = resolveHref(tab);
//         const active = isTabActive(tab);
//         const Icon = tab.icon;

//         // Special handling for Buy (Plus) button
//         if (tab.isPlus) {
//           return (
//             <Link key={tab.name} href={href}>
//               <div className='flex h-9 w-9 cursor-pointer items-center justify-center m-auto rounded-full bg-none shadow-xl shadow-cyan-600 transition-transform hover:scale-105'>
//                 <HiPlus className='text-[20px] font-black text-cyan-900' />
//               </div>
//             </Link>
//           );
//         }

//         // Admin vs User styling
//         const isAdminTab = isAdmin;
//         const activeColor = isAdminTab ? 'text-amber-600' : 'text-cyan-600';
//         const bgActive = isAdminTab ? 'bg-amber-500/20' : 'bg-cyan-500/20';

//         return (
//           <Link key={tab.name} href={href}>
//             <div className='flex flex-col items-center gap-0.5 relative'>
//               {isAdminTab && active && (
//                 <div className='absolute -top-1 right-0 rounded-full bg-amber-500 px-1.5 py-0.5 text-[6px] font-bold text-white'>
//                   ADMIN
//                 </div>
//               )}
//               <div className={`rounded-lg p-2 transition-colors ${active ? bgActive : ''}`}>
//                 <Icon className={`text-xl font-bold ${active ? activeColor : 'text-cyan-900'}`} />
//               </div>
//               <span className={`text-[8px] font-medium ${active ? activeColor : 'text-cyan-900'}`}>
//                 {tab.name}
//               </span>
//             </div>
//           </Link>
//         );
//       })}
//     </div>
//   );
// };

// export default Iconpack;

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LuLayoutDashboard } from "react-icons/lu";
import { BiTransfer } from "react-icons/bi";
import { MdAccountBalance } from "react-icons/md";
import { IoIosContact } from "react-icons/io";
import { CiCreditCard2 } from "react-icons/ci";
import { HiPlus } from "react-icons/hi";
import {
  FaShieldAlt,
  FaUsers,
  FaChartBar,
  FaCog,
  FaBolt,
} from "react-icons/fa";

// ---- Types ----------------------------------------------------------------

interface Tab {
  name: string;
  href: string;          // route OR #section-id
  icon: React.ComponentType<{ className?: string }>;
  isPlus?: boolean;
  isSection?: boolean;   // true → smooth-scroll to href instead of navigating
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
  { name: "Buy", href: "/Buy", icon: BiTransfer, isPlus: true },
  { name: "Bills", href: "/Bills", icon: MdAccountBalance },
  { name: "Settings", href: "/Settings", icon: IoIosContact },
];

// Admin tabs for non-/me admin pages
const ADMIN_TABS: Tab[] = [
  { name: "Admin", href: "/me", icon: FaShieldAlt },
  { name: "Users", href: "/me/users", icon: FaUsers },
  { name: "Analytics", href: "/me/analytics", icon: FaChartBar },
  { name: "Settings", href: "/me/settings", icon: FaCog },
];

// Admin section tabs — used ONLY on /me, scroll-jump within the page
const ADMIN_SECTION_TABS: Tab[] = [
  { name: "Overview",     href: "#admin-overview",     icon: LuLayoutDashboard, isSection: true },
  { name: "Users",        href: "#admin-users",        icon: FaUsers,           isSection: true },
  { name: "Activity",     href: "#admin-activity",     icon: FaChartBar,        isSection: true },
  { name: "Auto-Balance", href: "#admin-auto-balance", icon: FaBolt,            isSection: true },
  { name: "Requests",     href: "#admin-withdrawals",  icon: MdAccountBalance,  isSection: true },
];

// ---- Component ------------------------------------------------------------

const Iconpack = () => {
  const pathname = usePathname();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mount + user detection
  useEffect(() => {
    setMounted(true);
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

  // Keyboard visibility detection
  useEffect(() => {
    const detectKeyboard = () => {
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.getAttribute('contenteditable') === 'true';
      const windowHeight = window.innerHeight;
      const screenHeight = window.screen.height;
      const heightDifference = screenHeight - windowHeight;
      setIsKeyboardVisible(isInputFocused && heightDifference > 150);
    };

    detectKeyboard();

    const handleResize = () => detectKeyboard();
    const handleFocus = () => setTimeout(detectKeyboard, 100);
    const handleBlur = () => setTimeout(detectKeyboard, 100);

    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const heightDifference = windowHeight - viewportHeight;
        const activeElement = document.activeElement;
        const isInputFocused =
          activeElement?.tagName === 'INPUT' ||
          activeElement?.tagName === 'TEXTAREA' ||
          activeElement?.getAttribute('contenteditable') === 'true';
        setIsKeyboardVisible(isInputFocused && heightDifference > 150);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('focus', handleFocus, true);
    window.addEventListener('blur', handleBlur, true);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
    }
    window.addEventListener('scroll', detectKeyboard);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('focus', handleFocus, true);
      window.removeEventListener('blur', handleBlur, true);
      window.removeEventListener('scroll', detectKeyboard);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
      }
    };
  }, []);

  const isAdmin = user?.isAdmin === true || user?.role === 'admin';
  const isOnAdminPage = pathname?.startsWith('/me') || false;

  // Choose tabs — same precedence as DesktopNav
  let tabsToRender: Tab[];
  if (isOnAdminPage) {
    tabsToRender = ADMIN_SECTION_TABS;
  } else if (isAdmin) {
    tabsToRender = ADMIN_TABS;
  } else {
    tabsToRender = USER_TABS;
  }

  // ---- Helpers ------------------------------------------------------------

  // Resolve dynamic href (used only for non-section tabs)
  const resolveHref = (tab: Tab): string => {
    if (!tab.isSection && tab.name === "Users" && isAdmin) {
      if (user?._id) return `/me/users/${user._id}`;
      return "/me/users";
    }
    return tab.href;
  };

  // Active state (sections never show "active" — they scroll)
  const isTabActive = (tab: Tab): boolean => {
    if (tab.isSection) return false;
    const href = resolveHref(tab);
    if (tab.name === "Users" && isAdmin) {
      return pathname.startsWith("/me/users/") || pathname === "/me/users";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Section click handler — smooth-scroll, update hash, no page nav
  const handleSectionClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', href);
    }
  };

  // ---- Render -------------------------------------------------------------

  // SSR / loading fallback — same outer shell
  if (!mounted || isLoading) {
    return (
      <div className='fixed z-10 bottom-0 left-0 right-0 flex w-full items-center justify-around bg-white/10 px-2 py-2 shadow-xl backdrop-blur-sm lg:hidden'>
        {USER_TABS.map((tab) => {
          const Icon = tab.icon;
          if (tab.isPlus) {
            return (
              <div key={tab.name} className='flex h-9 w-9 cursor-pointer items-center justify-center m-auto rounded-full bg-none shadow-xl shadow-cyan-600 transition-transform hover:scale-105'>
                <HiPlus className='text-[20px] font-black text-cyan-900' />
              </div>
            );
          }
          return (
            <div key={tab.name} className='flex flex-col items-center gap-0.5'>
              <div className='rounded-lg p-2 transition-colors text-cyan-600 hover:text-cyan-400'>
                <Icon className='text-xl font-bold text-cyan-900' />
              </div>
              <span className='text-[8px] font-medium text-cyan-900'>{tab.name}</span>
            </div>
          );
        })}
      </div>
    );
  }

  if (isKeyboardVisible) return null;

  // ---- Main render --------------------------------------------------------

  // The bottom bar is admin-themed when we're on /me
  const useAdminTheme = isOnAdminPage || isAdmin;

  return (
    <div className='fixed z-10 bottom-0 left-0 right-0 flex w-full items-center justify-around bg-white/10 px-2 py-2 shadow-xl backdrop-blur-sm lg:hidden'>
      {tabsToRender.map((tab) => {
        const href = resolveHref(tab);
        const active = isTabActive(tab);
        const Icon = tab.icon;

        // Special handling for Buy (Plus) button — non-admin only
        if (tab.isPlus) {
          return (
            <Link key={tab.name} href={href}>
              <div className='flex h-9 w-9 cursor-pointer items-center justify-center m-auto rounded-full bg-none shadow-xl shadow-cyan-600 transition-transform hover:scale-105'>
                <HiPlus className='text-[20px] font-black text-cyan-900' />
              </div>
            </Link>
          );
        }

        const activeColor = useAdminTheme ? 'text-amber-600' : 'text-cyan-600';
        const bgActive = useAdminTheme ? 'bg-amber-500/20' : 'bg-cyan-500/20';

        // ---- Section item (button + scroll) ----
        if (tab.isSection) {
          return (
            <button
              key={tab.name}
              type='button'
              onClick={(e) => handleSectionClick(e, href)}
              className='flex flex-col items-center gap-0.5 relative'
              aria-label={`Jump to ${tab.name}`}
            >
              <div className={`rounded-lg p-2 transition-colors`}>
                <Icon className={`text-xl font-bold text-cyan-900`} />
              </div>
              <span className={`text-[8px] font-medium text-cyan-900`}>
                {tab.name}
              </span>
            </button>
          );
        }

        // ---- Route item (normal Link) ----
        return (
          <Link key={tab.name} href={href}>
            <div className='flex flex-col items-center gap-0.5 relative'>
              {useAdminTheme && active && (
                <div className='absolute -top-1 right-0 rounded-full bg-amber-500 px-1.5 py-0.5 text-[6px] font-bold text-white'>
                  ADMIN
                </div>
              )}
              <div className={`rounded-lg p-2 transition-colors ${active ? bgActive : ''}`}>
                <Icon className={`text-xl font-bold ${active ? activeColor : 'text-cyan-900'}`} />
              </div>
              <span className={`text-[8px] font-medium ${active ? activeColor : 'text-cyan-900'}`}>
                {tab.name}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default Iconpack;