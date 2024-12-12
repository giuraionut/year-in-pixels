import { ChevronRight, LayoutDashboard, Notebook, Smile } from 'lucide-react';
import React, { ReactElement, useEffect, useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import Link from 'next/link';
import { Url } from 'next/dist/shared/lib/router/router';
import { useRouter } from 'next/navigation';

type MenuItem = {
  label: string;
  icon?: ReactElement;
  isCollapsible: boolean;
  subItems?: MenuItem[];
  href?: Url;
};

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard className='mr-2' strokeWidth={2} />,
    isCollapsible: false,
    href: '/dashboard',
  },
  {
    label: 'Pixels',
    icon: <Notebook className='mr-2' strokeWidth={2} />,
    isCollapsible: false,
    href: '/pixels',
  },
  {
    label: 'Moods',
    icon: <Smile className='mr-2' strokeWidth={2} />,
    isCollapsible: false,
    href: '/moods',
  },
];
import { usePathname } from 'next/navigation';

export function SideBar() {
  const [isClient, setIsClient] = useState(false); // Track if we are on the client-side
  const pathname = usePathname(); // Get the current path from next/navigation

  useEffect(() => {
    // Check if window is defined (indicating client-side rendering)
    setIsClient(true);
  }, []);

  // Function to check if the current route matches the menu item's href
  const isActive = (href: string) => pathname === href;

  if (!isClient) {
    return null; // Prevent rendering until client-side is available
  }
  return (
    <Sidebar>
      <SidebarContent className='flex flex-col'>
        <SidebarGroup>
          <SidebarGroupLabel>Year in Pixels</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className=''>
              {menuItems.map((item, index) => (
                <React.Fragment key={index}>
                  {item.isCollapsible ? (
                    <Collapsible>
                      <SidebarMenuItem>
                        <CollapsibleTrigger
                          asChild
                          className='flex w-full items-center [&[data-state=open]>.chevron]:rotate-90'
                        >
                          <SidebarMenuButton className='flex items-center'>
                            {item.icon}
                            {item.label}
                            <ChevronRight className='ml-auto chevron transition-all ' />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.subItems?.map((subItem, subIndex) => (
                              <SidebarMenuSubItem key={subIndex}>
                                <SidebarMenuButton>
                                  <Link href={subItem.href ? subItem.href : ''}>
                                    {subItem.label}
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem>
                      <Link href={item.href ? item.href : ''}>
                        <SidebarMenuButton
                          className={`font-bold ${
                            isActive(String(item.href) || '')
                              ? 'bg-gray-200 hover:bg-gray-200'
                              : ''
                          }`}
                        >
                          {item.icon}
                          {item.label}
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  )}
                </React.Fragment>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
