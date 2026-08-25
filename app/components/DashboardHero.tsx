import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LuLayoutDashboard } from "react-icons/lu";
import { IoReceiptOutline } from "react-icons/io5";
import { MdAccountBalance } from "react-icons/md";
import { IoCardSharp } from "react-icons/io5";
import { BiTransfer } from "react-icons/bi";
import { LuChartNoAxesCombined } from "react-icons/lu";
import { FaMoneyBills } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";
import Iconpack from '@/app/components/Iconpack'



const DashboardHero = () => {
  const footerLinks = [
    { label: "Privacy Policy", href: "/Policy" },
    { label: "Security Audit", href: "/Policy" },
    { label: "Legal", href: "/Policy" },
  ];

  return (
    <div className="md:pt-9 md:pl-9 md:w-[16.3em] z-10">
      <div className='w-53 md:-p-15 hidden m-0 
      md:flex flex-col gap-[1.54em] scrollbar-track-transparent 
        scrollbar-thin scrollbar-thumb-transparent hover:scrollbar-thumb-transparent-cyan-900
         overflow-y-auto h-146'>

        <div className="hidden fixed bg-gradient-br from-blue-200
       to-cyan-200 border-none md:flex items-center">
          <Image
            src="/loadLogo_shield_smooth.png"
            alt="Shield logo"
            width={28}
            height={28}
            className="md:h-7 md:w-7 h-5 w-5"
          />
          <span className="font-bold m-2 p-auto text-[11.4px] md:text-lg">
            Ash Trust <span className="text-cyan-900">Bank</span>
          </span>
        </div>

        {/* <div className=':block w-auto h-[23em]p-[1.4em] rounded-2xl
        shadow-xl bg- bg-gradient-to-br from-blue-200
        via-cyan-100 to-gray-300'>
        
      </div> */}
        <div className="flex pt-6"></div>
        <div className='hover:bg-cyan-600/40 active:bg-slate-500/40 cursor-pointer
      w-[70%] font-bold h-auto text-md text-cyan-900 py-[1.4em]
       flex items-center justify-evenly rounded-2xl shadow-xl'>
          <LuLayoutDashboard className='font-bold text-[1.5em] text-cyan-900' />Dashboard
        </div>

        <div className='hover:bg-cyan-600/40 active:bg-slate-500/40 cursor-pointer
      w-[70%] font-bold h-auto text-md text-cyan-900 py-[1.4em]
       flex items-center justify-evenly rounded-2xl shadow-xl'>
          <IoReceiptOutline className='font-bold text-[1.5em] text-cyan-900' /> Transactions
        </div>

        <div className='hover:bg-cyan-600/40 active:bg-slate-500/40 cursor-pointer
      w-[70%] font-bold h-auto text-md text-cyan-900 py-[1.4em]
       flex items-center justify-evenly rounded-2xl shadow-xl'>
          <MdAccountBalance className='font-bold text-[1.5em] text-cyan-900' /> Account
        </div>

        <div className='hover:bg-cyan-600/40 active:bg-slate-500/40 cursor-pointer
      w-[70%] font-bold h-auto text-md text-cyan-900 py-[1.4em]
       flex items-center justify-evenly rounded-2xl shadow-xl'>
          <IoCardSharp className='font-bold text-[1.5em] text-cyan-900' /> Cards
        </div>

        <div className='hover:bg-cyan-600/40 active:bg-slate-500/40 cursor-pointer
      w-[70%] font-bold h-auto text-md text-cyan-900 py-[1.4em]
       flex items-center justify-evenly rounded-2xl shadow-xl'>
          <BiTransfer className='font-bold text-[1.5em] text-cyan-900' />Transfers
        </div>

        <div className='hover:bg-cyan-600/40 active:bg-slate-500/40 cursor-pointer
      w-[70%] font-bold h-auto text-md text-cyan-900 py-[1.4em]
       flex items-center justify-evenly rounded-2xl shadow-xl'>
          <LuChartNoAxesCombined className='font-bold text-[1.5em] text-cyan-900' />Investment
        </div>

        <div className='hover:bg-cyan-600/40 active:bg-slate-500/40 cursor-pointer
      w-[70%] font-bold h-auto text-md text-cyan-900 py-[1.4em]
       flex items-center justify-evenly rounded-2xl shadow-xl'>
          <FaMoneyBills className='font-bold text-[1.5em] text-cyan-900' />Bills
        </div>

        <div className='hover:bg-cyan-600/40 active:bg-slate-500/40 cursor-pointer
      w-[70%] font-bold h-auto text-md text-cyan-900 py-[1.4em]
       flex items-center justify-evenly rounded-2xl shadow-xl '>
          <IoMdSettings className='font-bold text-[1.5em] text-cyan-900' />Setttings
        </div>

        <div className='w-auto font-bold h-auto px-[2em] text-cyan-900 py-[1.4em]
        flex items-center justify-evenly bg-transparent'>
          <div className="mx-auto flex max-w-6xl md:flex-col flex-col
        gap-4 px-4 py-5 text-center text-[0.2em]
         text-cyan-900 sm:flex-row sm:px-6">
            <p className="flex -ml-10">© 2024 Ash Trust Bank plc. All rights reserved. Member FDIC.</p>
            <div className="flex -ml-10 md:gap-4">
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-medium uppercase cursor-progress 
                tracking-wide text-cyan-600 hover:text-cyan-500"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <Iconpack />
          </div>
        </div>
      </div>
    </div>

  )
}

export default DashboardHero
