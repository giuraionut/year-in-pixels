'use client';
import { Card } from '@/components/ui/card';
import { Mood } from '@prisma/client';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
export interface Artwork {
  artist: string;
  art: string;
}

export const works: Artwork[] = [
  {
    artist: 'Ornella Binni',
    art: 'https://images.unsplash.com/photo-1465869185982-5a1a7522cbcb?auto=format&fit=crop&w=300&q=80',
  },
  {
    artist: 'Tom Byrom',
    art: 'https://images.unsplash.com/photo-1548516173-3cabfa4607e9?auto=format&fit=crop&w=300&q=80',
  },
  {
    artist: 'Vladimir Malyavko',
    art: 'https://images.unsplash.com/photo-1494337480532-3725c85fd2ab?auto=format&fit=crop&w=300&q=80',
  },
];
const UserMoods = ({ userMoods }: { userMoods: Mood[] }) => {
  console.log('user moods');
  return (
    <ScrollArea>
      <Card className='flex w-full gap-2 p-2'>
        {!userMoods.length
          ? Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className='p-4 max-w-24 rounded-sm' />
            ))
          : userMoods.map((mood: Mood) => (
              <Card
                key={mood.id}
                style={{ backgroundColor: mood.color }}
                className='p-4'
              >
                {mood.name}
              </Card>
            ))}
      </Card>
      <ScrollBar orientation='horizontal' />
    </ScrollArea>
  );
};

export default UserMoods;
