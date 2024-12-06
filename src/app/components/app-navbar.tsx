'use client';
import { Card } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import React from 'react';
import { DarkModeToggle } from './darkmode-toggle';
import { Profile } from './profile';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Session } from 'next-auth';

export default function Navbar({ session }: { session: Session | null }) {
  return (
    <>
      <Card
        className={`${
          session
            ? `m-3 flex items-center p-2`
            : `top-0 left-0 right-0 flex items-center p-2 fixed rounded-none`
        }`}
      >
        {session && <SidebarTrigger />}
        <DarkModeToggle />
        {session ? (
          <Profile className='w-6 h-6 ml-auto mr-2' />
        ) : (
          <Button
            asChild
            variant='ghost'
            className='text-sm font-medium leading-none ml-auto mr-2'
          >
            <Link href='/api/auth/signin'>Login</Link>
          </Button>
        )}
      </Card>
    </>
  );
}
