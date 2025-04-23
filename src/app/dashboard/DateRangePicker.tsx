'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';

export default function DateRangePickerClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // We keep a DateRange where `to` may be undefined for single-day
  const [selection, setSelection] = useState<DateRange | undefined>();

  // Build the display label: either single date or a range
  const label = useCallback(() => {
    if (!selection?.from) {
      return 'Pick a date or range';
    }
    const fromLabel = format(selection.from, 'LLL dd, yyyy');
    if (!selection.to) {
      // single‑day
      return fromLabel;
    }
    const toLabel = format(selection.to, 'LLL dd, yyyy');
    return `${fromLabel} – ${toLabel}`;
  }, [selection]);

  // When user clicks "Apply", push the URL with from/to (to defaults to from)
  const handleApply = () => {
    if (!selection?.from) return;
    const from = selection.from.toISOString().split('T')[0];
    const to = (selection.to ?? selection.from).toISOString().split('T')[0];

    const params = new URLSearchParams(searchParams.toString());
    params.set('from', from);
    params.set('to', to);
    // remove year/month if present
    params.delete('year');
    params.delete('month');

    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' className='w-[300px] justify-start text-left'>
          <CalendarIcon className='mr-2 h-4 w-4' />
          {label()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          initialFocus
          mode='range'
          selected={selection}
          onSelect={setSelection}
          numberOfMonths={2}
        />
        <div className='p-2 flex gap-2'>
          <Button
            variant='ghost'
            onClick={() => setSelection(undefined)}
            disabled={!selection?.from}
          >
            Clear
          </Button>
          <Button
            onClick={handleApply}
            disabled={!selection?.from}
            className='flex-1'
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
