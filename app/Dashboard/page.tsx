"use client";

import React from 'react';
import { useSessionTracker } from '@/hooks/useSessionTracker'; // ✅ Imported hook
import Dash from '@/app/components/Dash';  // ✅ Import as Dash
import DesktopNav from '@/app/components/DesktopNav';
import Iconpack from '@/app/components/Iconpack';
import ChatWidgett from '@/app/components/ChatWidgett';
import UserVerificationWidget from '@/app/components/UserVerificationWidget';
import UserAvatar from '@/app/components/UserAvatar';

export default function DashboardPage() {
  useSessionTracker();

  return (
    <>
    
      

      <div className="grid bg-[#C4F8FD] grid-cols-1 md:grid-cols-1 gap-4 md:pb-0 pb-20">
        <DesktopNav />
        <Dash />
        <ChatWidgett />
        <UserVerificationWidget />
        <Iconpack />
      </div>
      
    </>
  );
}