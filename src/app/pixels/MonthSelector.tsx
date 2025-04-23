'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MONTH_NAMES = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];

/**
 * A Month selector that infers the current route structure like
 * /.../[year]/[month]/... and replaces the [month] segment.
 * It assumes the segment immediately following the currentYear segment is the month.
 * Props:
 * - currentMonth: The month currently reflected in the URL path segment (e.g., "04" for April).
 * - currentYear: The year currently reflected in the URL path segment (needed to locate the month segment).
 */
export type MonthSelectorProps = {
  currentMonth: string;
  currentYear: number;
};

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  currentMonth,
  currentYear,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const handleChange = (selectedMonthName: string) => {
    startTransition(() => {
      if (!pathname) {
        console.error('MonthSelector: Pathname is not available.');
        return;
      }

      const selectedMonthIndex = MONTH_NAMES.indexOf(
        selectedMonthName.toLowerCase()
      );
      if (selectedMonthIndex === -1) {
        console.error(
          `MonthSelector: Invalid month name selected: ${selectedMonthName}`
        );
        return;
      }

      const newMonthString = String(selectedMonthIndex + 1).padStart(2, '0');
      const currentYearString = String(currentYear);
      const segments = pathname.split('/');
      const yearSegmentIndex = segments.indexOf(currentYearString);
      if (yearSegmentIndex === -1) {
        console.warn(
          `MonthSelector: Could not find segment matching current year "${currentYearString}" in path "${pathname}". Cannot update URL.`
        );
        return;
      }

      const monthSegmentIndex = yearSegmentIndex + 1;
      if (monthSegmentIndex >= segments.length) {
        console.warn(
          `MonthSelector: Found year segment at index ${yearSegmentIndex}, but no segment exists after it for the month in path "${pathname}".`
        );
        return;
      }

      segments[monthSegmentIndex] = newMonthString;
      const daySegmentIndex = monthSegmentIndex + 1;
      if (segments.length > daySegmentIndex) {
        segments[daySegmentIndex] = '01';
        console.log(
          `MonthSelector: Resetting day segment to '01' at index ${daySegmentIndex}`
        );
      }

      const newPath = segments.join('/');
      router.push(newPath);
    });
  };
  return (
    <Select onValueChange={handleChange} defaultValue={currentMonth}>
      <SelectTrigger className='w-[160px]'>
        <SelectValue placeholder='Select month' />
      </SelectTrigger>
      <SelectContent>
        {MONTH_NAMES.map((m) => (
          <SelectItem key={m} value={m}>
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
