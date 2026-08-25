import React from 'react'
import AshTrustHero from '@/app/components/AshTrustHero'
import ChatWidgett from './components/ChatWidgett'

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="h-20 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-32 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
        <div className="h-32 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
        <div className="h-32 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
        <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
        <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
        <div className="h-64 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD]" />
      </div>
    </div>
  </div>
);
const page = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000))

  return (
    <>
      <AshTrustHero />
      <ChatWidgett />
    </>
  )
}

export default page
