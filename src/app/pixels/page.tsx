import React, { Suspense } from 'react';
import YearInPixels from './YearInPixels';

const page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <YearInPixels />
      </Suspense>
    </div>
  );
};

export default page;
