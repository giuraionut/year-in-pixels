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
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { User, Settings, LifeBuoy, Cloud, LogOut } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import React from 'react';

const handleLogout = () => {
  signOut({ callbackUrl: 'http://localhost:3000/' });
};

export function Profile({ className }: { className?: string }): JSX.Element {
  const { data: session } = useSession();
  if (session && session.user) {
    return (
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
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <User />
              <span>Profile</span>
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings />
              <span>Settings</span>
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <GitHubLogoIcon />
            <span>GitHub</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <LifeBuoy />
            <span>Support</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Cloud />
            <span>API</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut />
            <span>Log out</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return <div>User not logged in</div>;
}
