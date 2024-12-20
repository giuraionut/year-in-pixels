import React, { Suspense } from 'react';
import MoodsComponent from './MoodsComponent';
import { Metadata } from 'next';
import { LoadingDots } from '@/components/icons/loading-dots';
export const metadata: Metadata = {
  title: 'Moods',
  description: 'Moods',
};
export default function Moods() {
  return (
    <Suspense
      fallback={
        <div className='h-full flex items-center justify-center'>
          <LoadingDots />
        </div>
      }
    >
      <MoodsComponent />
    </Suspense>
  );
}
