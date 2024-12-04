'use client';
import { Card } from '@/components/ui/card';
import { Mood } from '@prisma/client';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function UserMoods({ userMoods }: { userMoods: Mood[] }) {
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
}
