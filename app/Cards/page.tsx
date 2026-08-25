import React from 'react'
import Card from "@/app/components/Card"
import Iconpack from '@/app/components/Iconpack';
import ChatWidgett from '../components/ChatWidgett';
import DesktopNav from '@/app/components/DesktopNav';


const page = () => {
  return (
    <>
      <DesktopNav/>
      <Card/>
      <ChatWidgett/>
      <Iconpack/>     
    </>
  )
}

export default page
