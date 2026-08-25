import React from 'react'
import Inv from "@/app/components/Inv"
import DesktopNav from '@/app/components/DesktopNav';
import Iconpack from '@/app/components/Iconpack'
import ChatWidgett from '@/app/components/ChatWidgett'

const page = () => {
  return (      
   <>
    <DesktopNav/>
    <Inv/>
    <ChatWidgett />
    <Iconpack />
   </>
  )
}

export default page
