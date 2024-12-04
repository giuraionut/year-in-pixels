'use client';
import { Card } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import React from 'react';
import { ModeToggle } from './darkmode-toggle';
import { Profile } from './profile';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function Navbar() {
  const { data: session } = useSession();

  return (
    <>
      <Card className='m-3 flex items-center'>
        <SidebarTrigger />
        <ModeToggle />
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

export default Navbar;
