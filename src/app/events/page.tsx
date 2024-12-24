import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { LoadingDots } from '@/components/icons/loading-dots';
import EventsComponent from './EventsComponent';
export const metadata: Metadata = {
  title: 'Events',
  description: 'Events',
};
export default function Events() {
  return (
    <Suspense
      fallback={
        <div className='h-full flex items-center justify-center'>
          <LoadingDots />
        </div>
      }
    >
      <EventsComponent />
    </Suspense>
  );
}
