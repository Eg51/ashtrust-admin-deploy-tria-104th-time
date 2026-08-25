import React from 'react'
import Link from 'next/link'
import BankRegistrationForm from '../components/BankRegistrationForm'
import Carousel from '../components/Carousel'




const page = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000))


  return (
    <div className="p-6 h-cover w-full flex bg-gradient-br from-blue-200 to-cyan-200
   items-center justify-around h-cover">
      <BankRegistrationForm />
      <Carousel />
    </div>
  )
}

export default page
