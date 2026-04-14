import React from 'react';
import { format } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import PixelSquare from './PixelSquare';
import { PixelWithRelations } from '@/types/pixel';

const SQUARE_SIZE = 13.4;
const SQUARE_GAP = 2;
const WEEK_WIDTH = SQUARE_SIZE + SQUARE_GAP;

const getCalendarDays = (year: number) => {
  const days: (Date | null)[] = [];
  const date = new Date(year, 0, 1);

  const dayOfWeek = date.getDay();
  const padding = (dayOfWeek + 6) % 7;

  for (let i = 0; i < padding; i++) {
    days.push(null);
  }

  while (date.getFullYear() === year) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return days;
};

const getWeeksPerMonth = (days: (Date | null)[]) => {
  const weeks: Record<number, number> = {};

  for (let i = 0; i < days.length; i += 7) {
    const week = days.slice(i, i + 7);
    const repDate = week[0] || week.find((d) => d !== null);

    if (repDate) {
      const month = repDate.getMonth();
      weeks[month] = (weeks[month] || 0) + 1;
    }
  }
  return weeks;
};

type PixelGridProps = {
  pixels: PixelWithRelations[];
  year: number;
  searchParams: Promise<{ color: string; selected: string }>;
};

const PixelGrid = async ({ pixels, year, searchParams }: PixelGridProps) => {
  const calendarDays = getCalendarDays(year);
  const { color } = await searchParams;
  const filterColor = color ? ['#' + color] : [];
  const weeksPerMonth = getWeeksPerMonth(calendarDays);

  const dayToPixelMap = () => {
    const map = new Map<string, PixelWithRelations>();
    pixels.forEach((pixel) => {
      const dateStr = format(new Date(pixel.pixelDate), 'yyyy-MM-dd');
      map.set(dateStr, pixel);
    });
    return map;
  };

  const styles = {
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
          if (!day) {
            return (
              <li
                key={index}
                style={{ width: `${SQUARE_SIZE}px`, height: `${SQUARE_SIZE}px` }}
              />
            );
          }
          const dateStr = format(day, 'yyyy-MM-dd');
          const pixel = dayToPixelMap().get(dateStr);
          const moods = pixel?.moods || [];
          const colors = moods.map((moodToPixel) => {
            try {
              const colorData = typeof moodToPixel.mood.color === 'string'
                ? JSON.parse(moodToPixel.mood.color)
                : moodToPixel.mood.color;
              return colorData.value;
            } catch (error) {
              console.error(
                'Error parsing color for mood:',
                moodToPixel.mood,
                error
              );
              return 'transparent';
            }
          });
          let background = 'lightgray';
          if (colors.length === 0) {
            background = 'lightgray';
          } else if (colors.length === 1) {
            background = colors[0];
          } else {
            const colorSpacing = 100 / colors.length;
            const gradientColors = colors
              .map((colorValue, index: number) => {
                const start = index * colorSpacing;
                const end = (index + 1) * colorSpacing;
                return `${colorValue} ${start}%, ${colorValue} ${end}%`;
              })
              .join(', ');
            background = `linear-gradient(to right, ${gradientColors})`;
          }

          const isFiltered =
            filterColor.length > 0 &&
            !colors.some((colorValue) => filterColor.includes(colorValue));
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <PixelSquare
                  day={day}
                  pixel={pixel || null}
                  size={SQUARE_SIZE}
                  initialBackground={background}
                  isInitiallyFiltered={isFiltered}
                />
              </TooltipTrigger>
              <TooltipContent>
                {moods.length > 0
                  ? moods.map((m) => m.mood.name).join(', ')
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

export default PixelGrid;
