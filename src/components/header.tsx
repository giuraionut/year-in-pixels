'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import React from 'react';
import { Profile } from './profile';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Session } from 'next-auth';
import CustomizeUserInterface from '../theme/ThemeColorComponent';

export default function Header({ session }: { session: Session | null }) {
  return (
    <header
      className='sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur 
    supports-[backdrop-filter]:bg-background/60 dark:border-border
    flex items-center gap-4 p-2'
    >
      {session && <SidebarTrigger />}
      <CustomizeUserInterface />
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
    </header>
  );
}
