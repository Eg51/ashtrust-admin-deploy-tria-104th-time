import React from 'react'
import Bil from '@/app/components/Bil'
import Iconpack from '@/app/components/Iconpack';
import ChatWidgett from '../components/ChatWidgett';
import DesktopNav from '@/app/components/DesktopNav';

const page = () => {
  return (
    <>
      <DesktopNav/>
      <Bil/>
      <ChatWidgett/>
      <Iconpack/>
    </>
  )
}

export default page
