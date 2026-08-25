"use client";

import Set from "@/app/components/Set";
import Iconpack from "@/app/components/Iconpack";
import ChatWidgett from "../components/ChatWidgett";
import DesktopNav from "@/app/components/DesktopNav";


export default function SettingsPage() {
  return (
    <>
      <DesktopNav />
      <Set/>
      <ChatWidgett />
      <Iconpack />
    </>
  );
}