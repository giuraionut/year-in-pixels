import React, { useState } from 'react';
import { format, getDaysInYear } from 'date-fns';
import { Pixel } from '@prisma/client';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

const SQUARE_SIZE = 13.4;
const SQUARE_GAP = 2;
const WEEK_WIDTH = SQUARE_SIZE + SQUARE_GAP;

const getDateMatrix = (year: number) => {
  const matrix: Date[][] = Array.from({ length: 7 }, () => []);
  let date = new Date(year, 0);

  for (let i = 0; i < 365; i++) {
    const rowIndex = i % 7;
    matrix[rowIndex].push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return matrix;
};

const getWeeksPerMonth = (dates: Date[]) => {
  return dates.reduce((acc, date) => {
    const month = date.getMonth();
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
};

const PixelsGrid = ({ pixels, year }: { pixels: Pixel[]; year: number }) => {
  const matrix = React.useMemo(() => getDateMatrix(year), []);
  const weeksPerMonth = React.useMemo(
    () => getWeeksPerMonth(matrix[0]),
    [matrix]
  );

  const styles = React.useMemo(
    () => ({
      graph: {
        display: 'inline-grid',
        gridTemplateAreas: `
        "empty months"
        "days squares"
      `,
        gridTemplateColumns: 'auto 1fr',
        gridGap: '10px',
      },
      months: {
        display: 'grid',
        gridTemplateColumns: Object.values(weeksPerMonth)
          .map((weeks) => `${WEEK_WIDTH * weeks}px`)
          .join(' '),
        gridArea: 'months',
      },
      days: {
        display: 'grid',
        gridGap: `${SQUARE_GAP}px`,
        gridTemplateRows: `repeat(7, ${SQUARE_SIZE}px)`,
        gridArea: 'days',
      },
      squares: {
        display: 'grid',
        gridGap: `${SQUARE_GAP}px`,
        gridTemplateRows: `repeat(7, ${SQUARE_SIZE}px)`,
        gridAutoFlow: 'column',
        gridAutoColumns: `${SQUARE_SIZE}px`,
        gridArea: 'squares',
      },
    }),
    [weeksPerMonth]
  );

  const [filterColor, setFilterColor] = useState<string | null>(null);

  const handleClickOnPixel = (pixel: Pixel) => {
    if (!pixel || !pixel.mood || !pixel.mood.color) {
      toast.error('No mood set for this pixel.');
      return;
    }

    const colorValue = pixel.mood.color.value;
    if (filterColor === colorValue) {
      setFilterColor(null);
    } else {
      setFilterColor(colorValue);
    }
  };

  return (
    <div
      style={styles.graph}
      className='text-[0.6rem] leading-3 py-2 overflow-auto'
    >
      <ul style={styles.months} className='border-b border-border pb-1'>
        {[
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ].map((month) => (
          <li key={month}>{month}</li>
        ))}
      </ul>

      <ul style={styles.days} className='border-r border-border pr-1'>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <li key={day}>{day}</li>
        ))}
      </ul>

      <ul style={styles.squares}>
  {[
    ...pixels,
    ...Array(
      Math.max(0, getDaysInYear(new Date(year, 0)) - pixels.length)
    ), // Ensure the length is never negative
  ].map((pixel, index) => (
    <Tooltip key={index}>
      <TooltipTrigger asChild>
        <li
          onClick={() => pixel && handleClickOnPixel(pixel)} // Avoid null pixels
          style={{
            backgroundColor:
              filterColor === null ||
              pixel?.mood?.color?.value === filterColor
                ? pixel?.mood?.color?.value || 'gray'
                : 'lightgray',
            width: `${SQUARE_SIZE}px`,
            height: `${SQUARE_SIZE}px`,
            transitionDuration: '0.25s',
          }}
          className='rounded-[2px] cursor-pointer'
        ></li>
      </TooltipTrigger>
      <TooltipContent>
        {pixel?.mood?.name
          ? pixel.mood.name.charAt(0).toUpperCase() +
            pixel.mood.name.slice(1)
          : 'Not set yet.'}{' '}
        {pixel?.pixelDate
          ? ` - ${format(new Date(pixel.pixelDate), 'PPP')}`
          : ''}
      </TooltipContent>
    </Tooltip>
  ))}
</ul>

    </div>
  );
};

export default PixelsGrid;
