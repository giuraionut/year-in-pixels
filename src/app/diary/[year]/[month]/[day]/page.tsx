import React from 'react';
import '../../../styles.css';
import DiaryComponent from '../../../DiaryComponent'; // Adjust path as needed
import { Metadata } from 'next';
import { getUserDiaryByDate } from '@/actions/diaryActions';
import { getUserPixelByDate } from '@/actions/pixelActions';
import { getSessionUserId } from '@/actions/actionUtils';
import {format } from 'date-fns';

export const metadata: Metadata = {
  title: 'Diary',
  description: 'Daily Diary',
};

export default async function JournalPage({
  params,
}: {
  params: Promise<{
    year: string;
    month: string;
    day: string;
  }>;
}) {
  const { year: yearString, month: monthString, day } = await params;

  const year = parseInt(yearString, 10);
  const monthIndex = parseInt(monthString, 10) - 1;
  const dayIndex = parseInt(day, 10);
  if (isNaN(year) || isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        Invalid year or month format in URL. Use /pixels/YYYY/MM (e.g.,
        /pixels/2024/04).
      </div>
    );
  }

  const fetchUserId = await getSessionUserId();
  if (!fetchUserId.success) {
    return <div className='p-6'>User not authenticated.</div>;
  }
  const userId = fetchUserId.data;
  const targetDate = new Date(year, monthIndex, dayIndex);
  
  const [fetchedDiary, fetchedPixel] = await Promise.all([
    getUserDiaryByDate(targetDate, userId),
    getUserPixelByDate(targetDate, userId)
  ]);

  if (!fetchedDiary.success) {
    return (
      <div className='flex items-center justify-center min-h-screen text-red-600'>
        Error loading diary for {format(targetDate, 'PPP')}: {fetchedDiary.error}
      </div>
    );
  }
  return (
    <DiaryComponent 
      userId={userId} 
      diary={fetchedDiary.data} 
      pixel={fetchedPixel.success ? fetchedPixel.data : null} 
      date={targetDate} 
    />
  );
}
