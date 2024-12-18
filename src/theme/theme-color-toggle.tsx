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
import { MoonIcon, SunIcon, SunMoon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Label } from '../components/ui/label';

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
    const selectedThemeColor = availableThemeColors.find(
      (theme) => theme.name === value
    );
    if (selectedThemeColor && selectedThemeColor.name === 'Zinc')
      setCustomHue(0);
    else if (selectedThemeColor) setCustomHue(selectedThemeColor.hue);
    setThemeColor(value as ThemeColors);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline'>Customize</Button>
      </PopoverTrigger>
      <PopoverContent className='w-full'>
        <div className='flex flex-col space-y-4'>
          {/* Color options*/}
          <Label htmlFor='color-select'>Color</Label>
          <Select
            name='color-select'
            onValueChange={(value) => handleSelect(value)}
            value={themeColor}
            key={themeColor || customHue}
          >
            <SelectTrigger className='w-full ring-offset-transparent focus:ring-transparent'>
              <SelectValue placeholder='Select Color' />
            </SelectTrigger>
            <SelectContent className='border-muted'>
              {createSelectItems()}
            </SelectContent>
          </Select>
          {/* Custom hue slider for colors */}
          <div className='w-full'>
            <SliderPrimitive.Root
              className={cn(
                'relative flex w-full touch-none select-none items-center'
              )}
              id='huePicker'
              value={[customHue ?? 0]}
              onValueChange={handleHueChange}
              max={360}
              step={1}
            >
              <SliderPrimitive.Track
                className='relative h-5 w-full grow overflow-hidden rounded-md'
                style={{ background: generateHueGradient() }}
              >
                <SliderPrimitive.Range className='absolute h-full' />
              </SliderPrimitive.Track>
              <SliderPrimitive.Thumb className='block h-5 w-5 rounded-md border border-primary/50 bg-background/50 shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50' />
            </SliderPrimitive.Root>
          </div>
          <Label htmlFor='mode-button'>Mode</Label>

          {/* Light/dark/system mode */}
          <div className='flex gap-3' id='mode-buttons'>
            <Button onClick={() => setTheme('light')}>
              <SunIcon className='h-[1.2rem] w-[1.2rem]' /> Light
            </Button>
            <Button onClick={() => setTheme('dark')}>
              <MoonIcon className='h-[1.2rem] w-[1.2rem]' /> Dark
            </Button>
            <Button onClick={() => setTheme('system')}>
              <SunMoon className='h-[1.2rem] w-[1.2rem]' /> System
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
