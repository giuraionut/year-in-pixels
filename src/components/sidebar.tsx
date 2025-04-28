import {
  Calendar,
  ChevronRight,
  LayoutDashboard,
  LayoutGrid,
  NotebookPen,
  Smile,
} from 'lucide-react';
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
    icon: <LayoutGrid className='mr-2' strokeWidth={2} />,
    isCollapsible: false,
    href: `/pixels/${format(nowZoned(),'yyyy/MM')}`,
  },
  {
    label: 'Moods',
    icon: <Smile className='mr-2' strokeWidth={2} />,
    isCollapsible: false,
    href: '/moods',
  },
  {
    label: 'Events',
    icon: <Calendar className='mr-2' strokeWidth={2} />,
    isCollapsible: false,
    href: '/events',
  },
  {
    label: 'Diary',
    icon: <NotebookPen className='mr-2' strokeWidth={2} />,
    isCollapsible: false,
    href: `/diary/${format(nowZoned(),'yyyy/MM/dd')}`,
  },
];
import { usePathname } from 'next/navigation';
import { format } from 'date-fns';
import AppVersion from './AppVersion';
import { nowZoned } from '@/lib/date';

export default function SideBar() {
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isActive = (href: string) => pathname === href;

  if (!isClient) {
    return null;
  }
  return (
    <Sidebar>
      <SidebarContent className='flex flex-col'>
        <SidebarGroup>
          <SidebarGroupLabel>
            <span className='flex items-center gap-2'>
            Year in Pixels <AppVersion/>
            </span>
            </SidebarGroupLabel>
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
                          isActive={isActive(String(item.href))}
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
