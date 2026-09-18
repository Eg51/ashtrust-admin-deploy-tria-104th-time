// "use client";

// import React, { useState, useEffect } from 'react';
// import AdminDashboard from '@/app/components/AdminDashboard'
// import DesktopNav from '@/app/components/DesktopNav'
// import IconPack from '@/app/components/Iconpack'
// import ChatWidgett from '@/app/components/ChatWidgett'
// import AutoBalanceAdmin from '@/app/components/AutoBalanceAdmin'
// import Tracker from '@/app/components/Tracker'
// import { useSessionTracker } from '@/hooks/useSessionTracker'
// import Activator from '@/app/components/Activator'
// // import AdminUserManager from '@/app/components/AdminUserManager';
// import AdminWithdrawalList from '@/app/components/AdminWithdrawalList';


// // ✅ ADDED: AdminDashboardSkeleton
// function AdminDashboardSkeleton() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
//         <div className="mx-auto max-w-6xl space-y-4">
//           <div className="h-20 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//           <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /></div>
//           <div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /><div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" /></div>
//         </div>
//       </div>
//   );
// }

// export default function Page() {
//   useSessionTracker(); // 🚀 Track the Admin's time here

//   // ✅ Adding a simple loading state (since we have the Skeleton)
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsLoading(false);
//     }, 1000);

//     return () => clearTimeout(timer);
//   }, []);

//   // ✅ Show Skeleton while loading
//   if (isLoading) {
//     return <AdminDashboardSkeleton />;
//   }

//   return (
//     <div> 
//       <AdminWithdrawalList/>
//       <AdminDashboard/>
//       {/* <AdminUserManager/> */}
//       <ChatWidgett
//         supportName="Admin"
//         message="  ?"
//         defaultOpen={false}
//         supportHours="clients may be waiting"
//         responseTime="i will respond any time i like "/>
//       <div className="">
//         <AutoBalanceAdmin/>
//         <Activator/>
//         <Tracker />
        
//       </div>
//     </div>
//   )
// }
// // app/me/
// "use client";

// import React, { useState, useEffect, useRef } from 'react';
// import AdminDashboard from '@/app/components/AdminDashboard';
// import ChatWidgett from '@/app/components/ChatWidgett';
// import AutoBalanceAdmin from '@/app/components/AutoBalanceAdmin';
// import Tracker from '@/app/components/Tracker';
// import { useSessionTracker } from '@/hooks/useSessionTracker';
// import Activator from '@/app/components/Activator';
// import AdminWithdrawalList from '@/app/components/AdminWithdrawalList';

// // ---- Section definitions -------------------------------------------------
// const SECTIONS = [
//   { id: 'admin-overview',     label: 'Overview' },
//   { id: 'admin-users',        label: 'Users' },
//   { id: 'admin-activity',     label: 'Activity' },
//   { id: 'admin-auto-balance', label: 'Auto-Balance' },
//   { id: 'admin-withdrawals',  label: 'Requests' },
// ] as const;

// // ---- Skeleton ------------------------------------------------------------
// function AdminDashboardSkeleton() {
//   return (
//     <div className="min-h-screen bg-[#C4F8FD] p-4 sm:p-6 lg:p-8">
//       <div className="mx-auto max-w-7xl space-y-6">
//         <div className="h-12 animate-pulse rounded-full bg-[#C4F8FD]" />
//         <div className="h-20 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
//           <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//           <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//           <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//         </div>
//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
//           <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//           <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//         </div>
//         <div className="h-48 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
//       </div>
//     </div>
//   );
// }

// // ---- Sticky Section Nav --------------------------------------------------
// function SectionNav() {
//   const [active, setActive] = useState<string>(SECTIONS[0].id);
//   const observerRef = useRef<IntersectionObserver | null>(null);

//   useEffect(() => {
//     // Disconnect any previous observer
//     if (observerRef.current) observerRef.current.disconnect();

//     const observer = new IntersectionObserver(
//       (entries) => {
//         // Pick the topmost visible section
//         const visible = entries
//           .filter((e) => e.isIntersecting)
//           .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

//         if (visible.length > 0) {
//           setActive(visible[0].target.id);
//         }
//       },
//       {
//         // Fires when a section's top crosses near the top of the viewport
//         rootMargin: '-96px 0px -70% 0px',
//         threshold: 0,
//       }
//     );

//     SECTIONS.forEach(({ id }) => {
//       const el = document.getElementById(id);
//       if (el) observer.observe(el);
//     });

//     observerRef.current = observer;
//     return () => observer.disconnect();
//   }, []);

//   const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
//     e.preventDefault();
//     const el = document.getElementById(id);
//     if (!el) return;
//     el.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     // Update hash without triggering a jump
//     window.history.replaceState(null, '', `#${id}`);
//   };

//   return (
//     <nav
//       aria-label="Section navigation"
//       className="sticky top-0 z-30 -mx-4 mb-2 border-b border-cyan-900/10 bg-[#C4F8FD] px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
//     >
//       <div className="mx-auto max-w-7xl">
//         <div className="flex gap-1.5 overflow-x-auto no-scrollbar sm:gap-2">
//           {SECTIONS.map(({ id, label }) => {
//             const isActive = active === id;
//             return (
//               <a
//                 key={id}
//                 href={`#${id}`}
//                 onClick={(e) => handleClick(e, id)}
//                 className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all sm:px-4 sm:text-sm ${
//                   isActive
//                     ? 'bg-cyan-600 text-white shadow-md'
//                     : 'bg-white/60 text-cyan-700 hover:bg-white/90 hover:text-cyan-900'
//                 }`}
//               >
//                 {label}
//               </a>
//             );
//           })}
//         </div>
//       </div>
//     </nav>
//   );
// }

// // ---- Page ----------------------------------------------------------------
// export default function Page() {
//   useSessionTracker();

//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsLoading(false);
//     }, 1000);
//     return () => clearTimeout(timer);
//   }, []);

//   if (isLoading) {
//     return <AdminDashboardSkeleton />;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
//       <div className="mx-auto max-w-7xl">
//         {/* Sticky section jump-nav */}
//         <SectionNav />

//         {/* Content sections */}
//         <div className="space-y-6">
//           {/* 1. Overview — AdminDashboard already carries id="admin-overview" */}
//           <AdminDashboard />

//           {/* 2. Users + Activity — side-by-side on desktop */}
//           <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
//             <div id="admin-users" className="scroll-mt-24">
//               <Activator />
//             </div>
//             <div id="admin-activity" className="scroll-mt-24">
//               <Tracker />
//             </div>
//           </div>

//           {/* 3. Auto-Balance — full width */}
//           <div id="admin-auto-balance" className="scroll-mt-24">
//             <AutoBalanceAdmin />
//           </div>

//           {/* 4. Withdrawal requests — full width */}
//           <div id="admin-withdrawals" className="scroll-mt-24">
//             <AdminWithdrawalList />
//           </div>
//         </div>
//       </div>

//       <ChatWidgett
//         supportName="Admin"
//         message="  ?"
//         defaultOpen={false}
//         supportHours="clients may be waiting"
//         responseTime="i will respond any time i like "
//       />
//     </div>
//   );
// }

"use client";

import React, { useState, useEffect } from 'react';
import AdminDashboard from '@/app/components/AdminDashboard';
import ChatWidgett from '@/app/components/ChatWidgett';
import AutoBalanceAdmin from '@/app/components/AutoBalanceAdmin';
import Tracker from '@/app/components/Tracker';
import { useSessionTracker } from '@/hooks/useSessionTracker';
import Activator from '@/app/components/Activator';
import AdminWithdrawalList from '@/app/components/AdminWithdrawalList';
import DesktopNav from '@/app/components/DesktopNav';
import Iconpack from '@/app/components/Iconpack';

// ---- Skeleton ------------------------------------------------------------
function AdminDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-20 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
          <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
          <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
          <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
        </div>
        <div className="h-48 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
      </div>
    </div>
  );
}

// ---- Page ----------------------------------------------------------------
export default function Page() {
  useSessionTracker();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8">
      {/* Desktop hamburger drawer (hidden < 1024px) */}
      <DesktopNav />

      <div className="mx-auto max-w-7xl space-y-6">

        {/* 1. Overview — AdminDashboard carries id="admin-overview" internally */}
        <AdminDashboard />

        {/* 2. Users + Activity — side-by-side on desktop, stacked on tablet/mobile */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div id="admin-users" className="scroll-mt-24">
            <Activator />
          </div>
          <div id="admin-activity" className="scroll-mt-24">
            <Tracker />
          </div>
        </div>

        {/* 3. Auto-Balance — full width */}
        <div id="admin-auto-balance" className="scroll-mt-24">
          <AutoBalanceAdmin />
        </div>

        {/* 4. Withdrawal requests — full width */}
        <div id="admin-withdrawals" className="scroll-mt-24">
          <AdminWithdrawalList />
        </div>

      </div>

      {/* Mobile + tablet bottom nav (hidden ≥ 1024px) */}
      <Iconpack />

      {/* Floating chat */}
      <ChatWidgett
        supportName="Admin"
        message="  ?"
        defaultOpen={false}
        supportHours="clients may be waiting"
        responseTime="i will respond any time i like "
      />
    </div>
  );
}