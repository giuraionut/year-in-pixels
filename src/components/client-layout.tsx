"use client";

import { SessionProvider } from "next-auth/react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import { Session } from "next-auth";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import Header from "./header";
import { SideBar } from "./sidebar";
import Footer from "./footer";
import ThemeProvider from "./theme-provider";

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
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SidebarProvider
          style={
            {
              "--sidebar-width": "12rem",
              "--sidebar-width-mobile": "12rem",
            } as React.CSSProperties
          }
        >
          {session ? <SideBar /> : ""}

          <TooltipProvider>
            <div className="mx-auto w-full border-border/40 dark:border-border min-[1800px]:max-w-[1536px] min-[1800px]:border-x flex flex-col">
              <Header session={session} />
              <main className="flex-1">{children}</main>
              <Footer />
              <Toaster />
            </div>
          </TooltipProvider>
        </SidebarProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
