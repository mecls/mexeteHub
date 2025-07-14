import React from 'react'
import Image from 'next/image'
import { WaitlistForm } from './waitlist/form'
import Link from 'next/link'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'
const page = () => {
  return (
    <div className='flex flex-col items-center justify-center h-screen w-full max-w-md mx-auto'>
      <Link href="/">
        <Image src="/logo_v1.png" alt="Mexete Hub" width={100} height={100} />
      </Link>
      <h1 className='text-4xl font-bold font-clash-display-bold'>Mexete</h1>
      <p className='text-lg font-clash-display-light'>
        The ultimate workspace for one-person businesses</p>
      <div className='w-full max-w-md mx-auto mt-10'>
        <Button className='w-full' asChild>
          <Link href="/myhub">
            Start your journey
          </Link>
        </Button>
      </div>
    </div>
  )
}
export default page