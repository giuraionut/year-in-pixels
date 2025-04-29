'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { Pixel, MoodToPixel, Mood } from '@prisma/client';

import { toast } from 'sonner';

interface PixelSquareProps {
  day: Date;
  pixel: Pixel | null;
  size: number;
  initialBackground: string;
  isInitiallyFiltered: boolean;
}

export default function PixelSquare({
  day,
  pixel,
  size,
  initialBackground,
  isInitiallyFiltered,
}: PixelSquareProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleClick = () => {
    const pixelMoods = pixel?.moods ?? [];
    const validMoodsWithColors = pixelMoods
      .map((mtp: MoodToPixel) => {
        try {
          const moodName = mtp.mood.name;
          const parsedColor = JSON.parse(mtp.mood.color) as Color;

          if (
            !parsedColor ||
            typeof parsedColor.value !== 'string' ||
            parsedColor.value === 'transparent'
          ) {
            return null;
          }

          const colorValue = parsedColor.value.startsWith('#')
            ? parsedColor.value.slice(1)
            : parsedColor.value;

          return { moodName, colorValue };
        } catch (error) {
          console.error(
            'Failed to parse mood color JSON for mood:',
            mtp.mood?.name,
            mtp.mood?.color,
            error
          );
          return null;
        }
      })
      .filter((item: Mood) => item !== null);

    const currentFilterColor = searchParams.get('color');

    const newParams = new URLSearchParams(searchParams.toString());
    const pushWithParams = () => {
      const qs = newParams.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    };

    if (validMoodsWithColors.length === 0) {
      if (currentFilterColor) {
        newParams.delete('color');
        pushWithParams();
        toast.info('Color filter cleared.');
      } else {
        toast.error('No mood set for this day.');
      }
      return;
    }

    if (validMoodsWithColors.length === 1) {
      const { moodName, colorValue } = validMoodsWithColors[0];

      if (colorValue === currentFilterColor) {
        newParams.delete('color');
        toast.info(
          <span>
            Filter for <span className='font-bold'>{moodName}</span> cleared.
          </span>
        );
      } else {
        newParams.set('color', colorValue);
        toast.info(
          <span>
            Filtering by <span className='font-bold'>{moodName}</span>.
          </span>
        );
      }
      pushWithParams();
      return;
    }

    const matchedMood = validMoodsWithColors.find(
      (item: Mood) => item.colorValue === currentFilterColor
    );

    if (matchedMood) {
      newParams.delete('color');
      pushWithParams();
      toast.info(
        <span>
          Filter for <span className='font-bold'>{matchedMood.moodName}</span>
          cleared.
        </span>
      );
    } else {
      toast.warning(
        <span>
          Cannot filter by multiple moods:{' '}
          {validMoodsWithColors.map((item: Mood, index: number) => (
            <span key={item.moodName} className='font-bold'>
              {item.moodName}
              {index < validMoodsWithColors.length - 1 && ', '}
            </span>
          ))}
          . Please select one.
        </span>
      );
    }
  };
  return (
    <li
      onClick={handleClick}
      style={{
        background: isInitiallyFiltered
          ? 'hsl(var(--muted))'
          : initialBackground,
        width: `${size}px`,
        height: `${size}px`,
        transition: 'background 0.1s ease-in-out',
      }}
      className='rounded-[2px] cursor-pointer hover:scale-110 hover:outline-1 hover:outline-offset-1 hover:outline-primary transition-transform duration-100 ease-in-out' // Added hover effects
      aria-label={`Pixel for ${format(day, 'yyyy-MM-dd')}`}
    ></li>
  );
}
