import React, { Suspense } from 'react';
import YearInPixels from './PixelsComponent';
import { Metadata } from 'next';
import { LoadingDots } from '@/components/icons/loading-dots';
export const metadata: Metadata = {
  title: 'Pixels',
  description: 'Pixels',
};
export default function Pixels() {
  return (
    <Suspense
      fallback={
        <div className='  h-full flex items-center justify-center'>
          <LoadingDots />
        </div>
      }
    >
      <YearInPixels />
    </Suspense>
  );
}
