import React, { Suspense } from 'react';
import Profile from './Profile';
import { LoadingDots } from '@/components/icons/loading-dots';

export default function UserSettings() {
  return (
    <Suspense
      fallback={
        <div className='h-full flex items-center justify-center'>
          <LoadingDots />
        </div>
      }
    >
      <Profile />
    </Suspense>
  );
}
