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

/**
 * A Year selector that infers the current route and replaces the
 * segment matching the currentYear with the newly selected year,
 * leaving subsequent segments (month, day) unchanged.
 * Props:
 * - currentYear: the year currently reflected in the URL path segment.
 * - years?: explicit array of years to display. If not provided, defaults
 *           to a range around the currentYear.
 */
export type YearSelectorProps = {
  currentYear: number;
  years?: number[];
};

export const YearSelector: React.FC<YearSelectorProps> = ({
  currentYear,
  years,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const yearOptions =
    years ??
    Array.from(
      { length: 7 },
      (_, i) => currentYear - 3 + i
    );

  const handleChange = (selectedYearString: string) => {
    startTransition(() => {
      if (!pathname) {
        console.error('YearSelector: Pathname is not available.');
        return;
      }

      const currentYearString = String(currentYear);
      const segments = pathname.split('/');
      const yearSegmentIndex = segments.indexOf(currentYearString);

      if (yearSegmentIndex === -1) {
        console.warn(
          `YearSelector: Could not find segment matching current year "${currentYearString}" in path "${pathname}". Cannot update URL.`
        );
        return;
      }

      segments[yearSegmentIndex] = selectedYearString;

      const newPath = segments.join('/');
      router.push(newPath);
    });
  };

  const currentYearValue = String(currentYear);

  return (
    <Select onValueChange={handleChange} value={currentYearValue}>
      <SelectTrigger className='w-[120px]'>
        <SelectValue placeholder='Select year' />
      </SelectTrigger>
      <SelectContent>
        {yearOptions.map((y) => (
          <SelectItem key={y} value={String(y)}>
            {y}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
