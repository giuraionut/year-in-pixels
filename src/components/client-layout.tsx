'use client';

import { SessionProvider } from 'next-auth/react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from 'sonner';
import { ThemeProvider } from './theme-provider';
import { AppSidebar } from './app-sidebar';
import Navbar from './app-navbar';
import { Session } from 'next-auth';
import { TooltipProvider } from '@radix-ui/react-tooltip';

export default function ClientLayout({
  session,
  children,
}: Readonly<{
  session: Session | null;
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute='class'
        defaultTheme='system'
        enableSystem
        disableTransitionOnChange
      >
        <SidebarProvider
          style={
            {
              '--sidebar-width': '12rem',
              '--sidebar-width-mobile': '12rem',
            } as React.CSSProperties
          }
        >
          {session ? <AppSidebar /> : ''}

          <TooltipProvider>
            <div className='flex flex-col w-screen gap-3'>
              <nav>
                <Navbar session={session} />
              </nav>
              <main className='flex items-center justify-center h-full'>
                {children}
              </main>
              <Toaster />
            </div>
          </TooltipProvider>
        </SidebarProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
