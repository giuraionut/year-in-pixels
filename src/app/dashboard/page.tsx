import React from 'react';
import { BarChartComponent } from './BarChartComponent';
import type { Metadata } from 'next';
import { DatePickerWithRange } from '../components/date-range-picker';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Dashboard',
};

export default function Dashboard() {
  return (
    <div className='grid grid-cols-5 gap-4 p-6 w-full'>
      {/* Header */}
      <h2 className='text-3xl font-extrabold tracking-tight col-span-5 sm:col-span-3'>
        Dashboard
      </h2>

      {/* Date Picker */}
      <DatePickerWithRange className='col-span-5 sm:col-span-2 justify-self-end' />

      {/* Cards Section */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 col-span-5'>
        {[...Array(4)].map((_, index) => (
          <Card key={index} className='h-[150px]' />
        ))}
      </div>

      {/* Chart */}
      <BarChartComponent className='col-span-5 lg:col-span-3' />

      {/* Additional Card */}
      <Card className='h-[300px] lg:h-full col-span-5 lg:col-span-2' />
    </div>
  );
}
