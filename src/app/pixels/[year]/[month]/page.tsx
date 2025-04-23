import { getSessionUserId } from '@/actions/actionUtils';
import { getUserEvents } from '@/actions/eventActions';
import { getUserMoods } from '@/actions/moodActions';
import { getUserPixelsByRange } from '@/actions/pixelActions';
import CalendarGrid from '@/components/calendar-grid';
import React from 'react';
import {
  startOfMonth,
  endOfMonth,
  format,
  isValid,
  isEqual,
  startOfDay,
} from 'date-fns';
import PixelDayDialog from '../../PixelDayDialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type PixelsMonthPageProps = {
  params: Promise<{
    year: string;
    month: string;
  }>;
};

const PixelsMonthPage = async ({ params }: PixelsMonthPageProps) => {
  const { year: yearString, month: monthString } = await params;

  const year = parseInt(yearString, 10);
  const monthIndex = parseInt(monthString, 10) - 1;

  if (isNaN(year) || isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        Invalid year or month format in URL. Use /pixels/YYYY/MM (e.g.,
        /pixels/2024/04).
      </div>
    );
  }

  const targetDate = new Date(year, monthIndex, 1);

  if (!isValid(targetDate)) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        Invalid date derived from parameters.
      </div>
    );
  }

  const from = startOfMonth(targetDate);
  const to = endOfMonth(targetDate);

  const fetchUserId = await getSessionUserId();
  if (!fetchUserId.success) {
    return { success: false, error: 'User not authenticated.' };
  }
  const userId = fetchUserId.data;

  const [moodsResult, eventsResult, pixelsResult] = await Promise.all([
    getUserMoods(userId),
    getUserEvents(userId),
    getUserPixelsByRange(from, to, userId),
  ]);

  if (!pixelsResult.success) {
    return (
      <div className='p-4 text-center text-red-600'>
        Error fetching pixels for {format(targetDate, 'MMMM yyyy')}:{' '}
        {pixelsResult.error}
      </div>
    );
  }
  if (!eventsResult.success) {
    return (
      <div className='p-4 text-center text-red-600'>
        Error fetching events: {eventsResult.error}
      </div>
    );
  }
  if (!moodsResult.success) {
    return (
      <div className='p-4 text-center text-red-600'>
        Error fetching moods: {moodsResult.error}
      </div>
    );
  }

  return (
    <div className='flex flex-col w-full max-w-[800px] mx-auto gap-6 p-4'>
      <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
        <h1 className='text-2xl font-bold'>
          Pixels - {format(targetDate, 'MMMM yyyy')}
        </h1>
        <Button asChild variant='outline'>
          <Link href={`/pixels/${year}`}>View Anually</Link>
        </Button>
      </div>

      <CalendarGrid
        currentDate={targetDate}
        pixels={pixelsResult.data}
        userMoods={moodsResult.data}
        userEvents={eventsResult.data}
        className='w-full'
      >
        {(targetDate, background) => (
          <PixelDayDialog
            background={background}
            targetDate={targetDate}
            currentMonth={monthIndex + 1}
            userMoods={moodsResult.data}
            userEvents={eventsResult.data}
            pixel={pixelsResult.data.find((pixel) =>
              isEqual(startOfDay(pixel.pixelDate), startOfDay(targetDate))
            )}
          />
        )}
      </CalendarGrid>
    </div>
  );
};

export default PixelsMonthPage;
