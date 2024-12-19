import type { Metadata } from 'next';
import DashboardComponent from './DashboardComponent';
import { LoadingDots } from '@/components/loading-dots';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Dashboard',
};

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className='  h-full flex items-center justify-center'>
          <LoadingDots />
        </div>
      }
    >
      <DashboardComponent />
    </Suspense>
  );
}
