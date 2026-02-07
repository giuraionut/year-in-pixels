import React from 'react';
import { getUserPixelsByRange } from '@/actions/pixelActions';
import { endOfYear, startOfYear, isValid, parseISO } from 'date-fns';
import { getSessionUserId } from '@/actions/actionUtils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PixelGrid from '../PixelGrid';
import { YearSelector } from '../YearSelector';
import YearlyInsights from './YearlyInsights';
import { getUserDiaryByDate } from '@/actions/diaryActions';

type PixelsYearPageProps = {
  params: Promise<{
    year: string;
  }>;

  searchParams: Promise<{ color: string; selected: string }>;
};

const PixelsYearPage = async ({
  params,
  searchParams,
}: PixelsYearPageProps) => {
  const { year: yearString } = await params;
  const { color, selected } = await searchParams;

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
    return <div className='p-6'>User not authenticated.</div>;
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

  let diary = null;
  if (selected) {
    const selectedDate = parseISO(selected);
    if (isValid(selectedDate)) {
      const diaryResult = await getUserDiaryByDate(selectedDate, userId);
      if (diaryResult.success) {
        diary = diaryResult.data;
      }
    }
  }

  return (
    <div className='flex flex-col w-full max-w-[900px] mx-auto gap-6 p-4'>
      <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
        <h1 className='text-2xl font-bold'>Pixels - {year}</h1>

        <Button asChild variant={'outline'} className='w-fit'>
          <Link href={`/pixels/${year}/01`}>View Monthly</Link>
        </Button>
      </div>
      <YearSelector currentYear={year} />

      <PixelGrid
        year={year}
        pixels={pixelsResult.data || []}
        searchParams={searchParams}
      />

      <YearlyInsights
        pixels={pixelsResult.data || []}
        year={year}
        selectedDate={selected || null}
        diary={diary}
      />
    </div>
  );
};

export default PixelsYearPage;
