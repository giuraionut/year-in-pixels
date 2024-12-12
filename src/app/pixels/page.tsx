import React, { Suspense } from 'react';
import YearInPixels from './YearInPixels';
import { Metadata } from 'next';
import { LoadingDots } from '@/components/loading-dots';
export const metadata: Metadata = {
  title: 'Pixels',
  description: 'Pixels',
};
export default function Pixels() {
  return (
    <Suspense
      fallback={
        <div className='  h-full flex items-center justify-center'>
          <LoadingDots></LoadingDots>
        </div>
      }
    >
      <YearInPixels />
    </Suspense>
  );
}
