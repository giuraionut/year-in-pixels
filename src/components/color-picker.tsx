'use client';

import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const colors = [
  { name: 'Slate', value: '#64748b' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Zinc', value: '#71717a' },
  { name: 'Neutral', value: '#737373' },
  { name: 'Stone', value: '#78716c' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Fuchsia', value: '#d946ef' },
];

type ColorPickerProps = {
  color: Color;
  onChange: (color: Color) => void;
};

type Color = {
  name: string;
  value: string;
};

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [open, setOpen] = React.useState(false);
  const colorInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedColor, setSelectedColor] = React.useState<Color>(color);

  const handleColorChange = (newColor: Color) => {
    setSelectedColor(newColor);
    onChange(newColor);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-[280px] justify-between'
        >
          {selectedColor ? (
            <div className='flex items-center gap-2'>
              <div
                className='h-5 w-5 rounded-full border border-gray-200 dark:border-gray-800'
                style={{ backgroundColor: selectedColor.value }}
              />
              <span className='font-medium'>{selectedColor.name}</span>
            </div>
          ) : (
            <span>Select a color</span>
          )}
          <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[280px] p-2 flex flex-col gap-3'>
        <div className='grid grid-cols-5 gap-2 mb-2 m-auto w-full place-items-center'>
          {colors.map((color) => (
            <div
              key={color.value}
              className='h-8 w-8 rounded-lg items-center flex cursor-pointer'
              style={{ backgroundColor: color.value }}
              onClick={() => {
                handleColorChange(color);
                setOpen(false);
                if (colorInputRef.current) {
                  colorInputRef.current.value = color.value; // Synchronize with the input
                }
              }}
            >
              <span className='sr-only'>Select color: {color.name}</span>
              {selectedColor?.value === color.value && (
                <Check className='h-4 w-4 text-white m-auto' />
              )}
            </div>
          ))}
        </div>
        <div className='text-sm flex items-center gap-3'>
          Custom:
          <Card
            className='h-5 w-full cursor-pointer flex items-center justify-center rounded-md'
            style={{ backgroundColor: selectedColor?.value || '#000000' }}
            onClick={() => colorInputRef.current?.click()}
          >
            <Input
              ref={colorInputRef}
              type='color'
              id='color'
              value={selectedColor.value}
              onChange={(e) => {
                const c: Color = {
                  name: e.target.value,
                  value: e.target.value,
                };
                handleColorChange(c);
              }}
              className='sr-only'
              aria-label='Select custom color'
            />
          </Card>
          <span className='text-xs font-medium'>
            {selectedColor?.value || '#000000'}
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
