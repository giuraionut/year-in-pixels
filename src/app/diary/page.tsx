import React, { Suspense } from 'react';
import './styles.css';
import { LoadingDots } from '@/components/loading-dots';
import DiaryComponent from './DiaryComponent';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Diary',
  description: 'Diary',
};
export default function Journal() {
  return (
    <Suspense
      fallback={
        <div className='  h-full flex items-center justify-center'>
          <LoadingDots />
        </div>
      }
    >
      <DiaryComponent />
    </Suspense>
  );
}
