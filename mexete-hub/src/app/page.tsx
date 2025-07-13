import React from 'react'
import Image from 'next/image'
import { WaitlistForm } from './waitlist/form'
const page = () => {
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <nav className='flex justify-between items-center w-full'>
        <div className='flex items-center gap-2 justify-center w-full mb-4'>
          <Image src='/logo_v1.png' alt='logo' width={100} height={100} />
        </div>
      </nav>
      <h1 className='text-4xl font-bold font-clash-display-bold'>Mexete</h1>
      <p className='text-lg font-clash-display-light'>
      The ultimate workspace for one-person businesses</p>
      <div className='w-full max-w-md mx-auto mt-10'>
        <WaitlistForm />
      </div>
    </div>
  )
}

export default page