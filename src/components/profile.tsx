'use client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AvatarImage } from '@radix-ui/react-avatar';
import { User, LifeBuoy, Cloud, LogOut } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function Profile({ className }: { className?: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const navigateToProfile = () => {
    router.push('/profile');
  };
  return (
    session && (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className={`${className} cursor-pointer`}>
            <AvatarImage
              src={session.user.image!}
              alt={session.user.name ? session.user.name : 'unknown'}
            />
            <AvatarFallback>{session.user.name?.split('')[0]}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56'>
          <DropdownMenuLabel>
            <div className='flex gap-3 justify-between items-center'>
              {session.user.name}{' '}
              <Avatar className={`${className}`}>
                <AvatarImage>
                  src={session.user.image!}
                  alt={session.user.name ? session.user.name : 'unknown'}
                </AvatarImage>
                <AvatarFallback>
                  {session.user.name?.split('')[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={navigateToProfile}>
              <User />
              <span>Profile</span>
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut />
            <span>Log out</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  );
}
