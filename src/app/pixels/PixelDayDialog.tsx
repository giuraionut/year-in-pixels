'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Mood, Event, Pixel, MoodToPixel } from '@prisma/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import AddPixelDialogForm from './AddPixelDialogForm';
// import PixelDayDisplay from './PixelDayDisplay';

import dynamic from 'next/dynamic';

const PixelDayDisplay = dynamic(
  () => import('./PixelDayDisplay'),
  { ssr: false }
);
type PixelDayButtonProps = {
  targetDate: Date;
  background: string;
  userMoods: Mood[];
  userEvents: Event[];
  pixel: (Pixel & { moods: MoodToPixel[]; events: Event[] }) | null;
  currentMonth: number;
};

export default function PixelDayDialog({
targetDate,
  background,
  userMoods,
  userEvents,
  pixel,
  currentMonth
}: PixelDayButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <PixelDayDisplay date={targetDate} background={background}  currentMonth={currentMonth}/>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Pixel for {format(targetDate, 'PPP')}</DialogTitle>
          <DialogDescription>
            Select moods and events for this day. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <AddPixelDialogForm
          date={targetDate}
          userMoods={userMoods}
          userEvents={userEvents}
          existingPixel={pixel}
          onFormSubmit={() => setIsDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
