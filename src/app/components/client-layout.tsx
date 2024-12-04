'use client';

import { SessionProvider } from 'next-auth/react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from 'sonner';
import { ThemeProvider } from './theme-provider';
import { AppSidebar } from './app-sidebar';
import Navbar from './app-navbar';

function ClientLayout({
  children,
}: Readonly<{
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
          <AppSidebar />
          <div className='flex flex-col w-screen gap-3'>
            <Navbar />
            <main className='flex items-center justify-center'>{children}</main>
            <Toaster />
          </div>
        </SidebarProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

export default ClientLayout;
