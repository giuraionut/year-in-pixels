import React, { Suspense } from 'react';
import YearInPixels from './YearInPixels';

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <YearInPixels />
    </Suspense>
  );
};

export default page;
