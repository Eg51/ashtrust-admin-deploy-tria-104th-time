"use client";

import React from 'react';
import Dash from '@/app/components/Dash';  // ✅ Import as Dash
import DesktopNav from '@/app/components/DesktopNav';
import Iconpack from '@/app/components/Iconpack';
import ChatWidgett from '@/app/components/ChatWidgett';
import UserAvatar from '@/app/components/UserAvatar';

export default function DashboardPage() {
  return (
    <>
      <DesktopNav />
      <Dash />
      <ChatWidgett />
      <Iconpack />
    </>
  );
}