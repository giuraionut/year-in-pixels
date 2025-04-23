'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { Pixel, MoodToPixel } from '@prisma/client';

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
    const pixelColors: Color[] = pixelMoods
      .map((mtp: MoodToPixel) => {
        try {
          return JSON.parse(mtp.mood.color) as Color;
        } catch {
          return null;
        }
      })
      .filter(
        (c: Color): c is Color => c !== null && c.value !== 'transparent'
      );
    const stripped = pixelColors.map((c) =>
      c.value.startsWith('#') ? c.value.slice(1) : c.value
    );

    const currentFilterColor = searchParams.get('color');

    const newParams = new URLSearchParams(searchParams.toString());
    const pushWithParams = () => {
      const qs = newParams.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    };

    if (stripped.length === 0) {
      if (currentFilterColor) {
        newParams.delete('color');
        pushWithParams();
        toast.info('Filter cleared.');
      } else {
        toast.error('No mood set for this day.');
      }
      return;
    }

    if (stripped.length === 1) {
      const c = stripped[0];
      if (c === currentFilterColor) {
        newParams.delete('color');
        toast.info(`Filter for #${c} cleared.`);
      } else {
        newParams.set('color', c);
        toast.info(`Filtering by #${c}.`);
      }
      pushWithParams();
      return;
    }

    if (currentFilterColor && stripped.includes(currentFilterColor)) {
      newParams.delete('color');
      pushWithParams();
      toast.info(`Filter for #${currentFilterColor} cleared.`);
    } else {
      toast.warning(
        `Multiple moods (${stripped
          .map((c) => `#${c}`)
          .join(', ')}) set; cannot filter from this square.`
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
