import React, { useState } from 'react';
import { format } from 'date-fns';
import { MoodToPixel, Pixel } from '@prisma/client';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

const SQUARE_SIZE = 13.4;
const SQUARE_GAP = 2;
const WEEK_WIDTH = SQUARE_SIZE + SQUARE_GAP;

const getCalendarDays = (year: number) => {
  const days = [];
  const date = new Date(year, 0, 1);

  while (date.getFullYear() === year) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return days;
};

const getDateMatrix = (year: number) => {
  const matrix: Date[][] = Array.from({ length: 7 }, () => []);
  const date = new Date(year, 0);

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
  const calendarDays = React.useMemo(() => getCalendarDays(year), [year]);
  const matrix = React.useMemo(() => getDateMatrix(year), [year]);
  const [filterColor, setFilterColor] = useState<string[]>([]);

  const weeksPerMonth = React.useMemo(
    () => getWeeksPerMonth(matrix[0]),
    [matrix]
  );

  const dayToPixelMap = React.useMemo(() => {
    const map = new Map<string, Pixel>();
    pixels.forEach((pixel) => {
      const dateStr = format(new Date(pixel.pixelDate), 'yyyy-MM-dd');
      map.set(dateStr, pixel);
    });
    return map;
  }, [pixels]);

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

  const handleClickOnPixel = (pixel: Pixel) => {
    if (!pixel || !pixel.moods) {
      toast.error('No mood set for this pixel.');
      setFilterColor([]); // Clear filter if no moods
      return;
    }

    const selectedColorArray = pixel.moods.map((moodToPixel: MoodToPixel) =>
      typeof moodToPixel.mood.color === 'string'
        ? JSON.parse(moodToPixel.mood.color).value
        : moodToPixel.mood.color.value
    );

    // Determine if the currently clicked pixel's colors are already being filtered
    const isCurrentlyFiltered =
      filterColor.length > 0 &&
      filterColor.every((color) => selectedColorArray.includes(color));

    if (isCurrentlyFiltered) {
      setFilterColor([]); // Deselect ALL if clicked again
    } else {
      setFilterColor(selectedColorArray); // Select new filter
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
        {calendarDays.map((day, index) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const pixel = dayToPixelMap.get(dateStr);
          const moods = pixel?.moods || [];
          const colors = moods.map((moodToPixel: MoodToPixel) => {
            try {
              return typeof moodToPixel.mood.color === 'string'
                ? JSON.parse(moodToPixel.mood.color).value
                : moodToPixel.mood.color.value;
            } catch (error) {
              console.error(
                'Error parsing color for mood:',
                moodToPixel.mood,
                error
              );
              return 'transparent'; // Or some default value
            }
          });
          let background = 'lightgray';
          if (colors) {
            if (colors.length === 1) {
              background = `${colors[0]}`;
            }
            if (colors.length > 1) {
              const colorCount = colors.length;
              const colorSpacing = 100 / colorCount;
              const gradientColors = colors
                .map((color: string, index: number) => {
                  const start = index * colorSpacing;
                  const end = (index + 1) * colorSpacing;
                  return `${color || 'transparent'} ${start}%, ${
                    color || 'transparent'
                  } ${end}%`;
                })
                .join(', ');

              background = `linear-gradient(to right, ${gradientColors})`;
            }
          }

          // Check if ANY of the pixel's colors are included in the filterColor
          const isFiltered =
            filterColor.length > 0 &&
            !colors.some((color: string) => filterColor.includes(color));
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <li
                  onClick={() => handleClickOnPixel(pixel || null)}
                  style={{
                    background: isFiltered ? 'lightgray' : background,
                    width: `${SQUARE_SIZE}px`,
                    height: `${SQUARE_SIZE}px`,
                    transitionDuration: '0.25s',
                  }}
                  className='rounded-[2px] cursor-pointer'
                ></li>
              </TooltipTrigger>
              <TooltipContent>
                {moods.length > 0
                  ? moods.map((m: MoodToPixel) => m.mood.name).join(', ')
                  : 'Not set yet.'}
                {pixel?.pixelDate
                  ? ` - ${format(new Date(pixel.pixelDate), 'PPP')}`
                  : ''}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </ul>
    </div>
  );
};

export default PixelsGrid;
