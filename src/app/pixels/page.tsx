import React, { Suspense } from 'react';
import YearInPixels from './YearInPixels';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Pixels',
  description: 'Pixels',
};
export default function Pixels() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <YearInPixels />
    </Suspense>
  );
}
