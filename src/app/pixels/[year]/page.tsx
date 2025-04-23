import React from 'react';
import { getUserPixelsByRange } from '@/actions/pixelActions';
import { endOfYear, startOfYear, isValid } from 'date-fns';
import { getSessionUserId } from '@/actions/actionUtils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PixelGrid from '../PixelGrid';

type PixelsYearPageProps = {
  params: Promise<{
    year: string;
  }>;

  searchParams: Promise<{ color: string }>;
};

const PixelsYearPage = async ({
  params,
  searchParams,
}: PixelsYearPageProps) => {
  const { year: yearString } = await params;

  const year = parseInt(yearString, 10);
  if (isNaN(year)) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        Invalid year format in URL. Use /pixels/YYYY (e.g., /pixels/2024).
      </div>
    );
  }

  const yearStartDate = new Date(year, 0, 1);

  if (!isValid(yearStartDate)) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        Invalid year value provided.
      </div>
    );
  }

  const from = startOfYear(yearStartDate);
  const to = endOfYear(yearStartDate);

  const fetchUserId = await getSessionUserId();
  if (!fetchUserId.success) {
    return { success: false, error: 'User not authenticated.' };
  }
  const userId = fetchUserId.data;

  const pixelsResult = await getUserPixelsByRange(from, to, userId);

  if (!pixelsResult.success) {
    return (
      <div className='p-4 text-center text-red-600'>
        Error fetching pixels for year {year}: {pixelsResult.error}
      </div>
    );
  }

  return (
    <div className='flex flex-col w-full max-w-[900px] mx-auto gap-6 p-4'>
      <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
        <h1 className='text-2xl font-bold'>Pixel Log - {year}</h1>

        <Button asChild variant={'outline'} className='w-fit'>
          <Link href={`/pixels/${year}/01`}>View Monthly</Link>
        </Button>
      </div>

      <PixelGrid
        year={year}
        pixels={pixelsResult.data || []}
        searchParams={searchParams}
      />
    </div>
  );
};

export default PixelsYearPage;
