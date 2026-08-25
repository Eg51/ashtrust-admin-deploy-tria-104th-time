import React from 'react'
import Link from 'next/link'
import ChatWidgett from '@/app/components/ChatWidgett'
import DashboardHero from '@/app/components/DashboardHero'
import Iconpack from '../components/Iconpack'
import DashboardContent from '../components/DashboardContent'


const page = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000))


  return (
    <section className="flex flex-col not-last-of-type:p-9
        min-h-screen bg-cover w-auto overflow-y-hidden md:m-0 md:p-0
        bg-linear-to-br from-blue-200 via-cyan-100 to-gray-300 p-auto">


      <div className="flex p-auto">
        <div className="flex sticky bg-transparent overflow-x-hidden">
          <DashboardHero />
        </div>
        <div className="flex  left-0 top-0 right-0 w-screen flex-col
           scrollbar-track-transparent scrollbar-thin scrollbar-thumb-cyan-900
            overflow-y-scroll overflow-x-hidden h-auto p-auto md:p-4 m-0">
          <DashboardContent />
        </div>
      </div>

      <ChatWidgett />
      <div className="flex bg-cyan-200/6 place-items-baseline justify-baseline"><Iconpack /></div>
    </section>
  )
}

export default page
// 