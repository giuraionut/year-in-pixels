'use client';
import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useThemeContext } from '@/theme/theme-data-provider';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const availableThemeColors = [
  { name: 'Zinc', light: 'bg-zinc-900', dark: 'bg-zinc-700', hue: 240 },
  { name: 'Rose', light: 'bg-rose-600', dark: 'bg-rose-700', hue: 347 },
  { name: 'Blue', light: 'bg-blue-600', dark: 'bg-blue-700', hue: 221 },
  { name: 'Green', light: 'bg-green-600', dark: 'bg-green-500', hue: 142 },
  { name: 'Orange', light: 'bg-orange-500', dark: 'bg-orange-700', hue: 21 },
];
import * as SliderPrimitive from '@radix-ui/react-slider';

import { Button } from '../components/ui/button';
import { MoonIcon, Palette, SunIcon, SunMoon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover';
import { Label } from '../components/ui/label';
import { ThemeColors } from './theme.types';

export default function CustomizeUserInterface() {
  const { themeColor, setThemeColor, customHue, setCustomHue } =
    useThemeContext();
  const { theme, setTheme } = useTheme();

  const handleHueChange = (value: number[]) => {
    if (value.length > 0) {
      setCustomHue(value[0]);
      setThemeColor(undefined);
    }
  };

  const createSelectItems = () => {
    return availableThemeColors.map(({ name, light, dark }) => (
      <SelectItem key={name} value={name}>
        <div className='flex items-center space-x-3'>
          <div
            className={cn(
              'rounded-full',
              'w-[20px]',
              'h-[20px]',
              theme === 'light' ? light : dark
            )}
          ></div>
          <div className='text-sm'>{name}</div>
        </div>
      </SelectItem>
    ));
  };

  const generateHueGradient = () => {
    return `linear-gradient(to right, hsl(0, 100%, 50%) 0%, hsl(60, 100%, 50%) 16.67%, hsl(120, 100%, 50%) 33.33%, hsl(180, 100%, 50%) 50%, hsl(240, 100%, 50%) 66.67%, hsl(300, 100%, 50%) 83.33%, hsl(360, 100%, 50%) 100%)`;
  };


  const handleSelect = (value: string) => {
    if (value !== 'Custom') {
      const selectedThemeColor = availableThemeColors.find(
        (theme) => theme.name === value
      );
      if (selectedThemeColor) {
        setThemeColor(value as ThemeColors);
        setCustomHue(undefined);
      }
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='ghost' className='flex items-center space-x-2'>
          <span className='hidden md:block'>Customize</span>
          <Palette />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='grid gap-6 p-4 w-full max-w-sm'>
        <div>
          <Label htmlFor='color-select' className='mb-2'>
            Color
          </Label>
          <Select
            name='color-select'
            onValueChange={(value) => handleSelect(value)}
            value={
              customHue !== undefined && customHue !== null
                ? 'Custom'
                : themeColor
            }
          >
            <SelectTrigger className='ring-offset-transparent focus:ring-transparent'>
              <SelectValue placeholder='Select Color' />
            </SelectTrigger>
            <SelectContent className='border-muted'>
              {createSelectItems()}
              <SelectItem
                key='custom'
                value='Custom'
                disabled
              >
                <div className='flex items-center space-x-3'>
                  <div
                    className='rounded-full w-[20px] h-[20px]'
                    style={{
                      backgroundColor: `hsl(${customHue}, 100%, 50%)`,
                    }}
                  ></div>
                  <div className='text-sm'>Custom</div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor='huePicker' className='mb-2'>
            Custom Hue
          </Label>
          <SliderPrimitive.Root
            className='relative flex touch-none select-none items-center w-full'
            id='huePicker'
            value={[customHue ?? 0]}
            onValueChange={handleHueChange}
            max={360}
            step={1}
          >
            <SliderPrimitive.Track
              className='relative h-4 w-full overflow-hidden rounded-sm'
              style={{ background: generateHueGradient() }}
            >
              <SliderPrimitive.Range className='absolute h-full' />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb className='block h-5 w-5 rounded-full border border-primary/50 bg-background/50 shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50' />
          </SliderPrimitive.Root>
        </div>

        <Label htmlFor='mode-buttons'>Mode</Label>
        <div className='grid grid-cols-3 gap-3' id='mode-buttons'>
          <Button
            variant='outline'
            onClick={() => setTheme('light')}
            className='flex items-center justify-center gap-2'
          >
            <SunIcon className='h-5 w-5' /> Light
          </Button>
          <Button
            variant='outline'
            onClick={() => setTheme('dark')}
            className='flex items-center justify-center gap-2'
          >
            <MoonIcon className='h-5 w-5' /> Dark
          </Button>
          <Button
            variant='outline'
            onClick={() => setTheme('system')}
            className='flex items-center justify-center gap-2'
          >
            <SunMoon className='h-5 w-5' /> System
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
