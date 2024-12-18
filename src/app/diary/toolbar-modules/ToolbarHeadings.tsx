'use client';

import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Heading,
} from 'lucide-react';
import { Editor } from '@tiptap/react';
type Level = 1 | 2 | 3 | 4 | 5 | 6;
export default function ToolbarHeadings({ editor }: { editor: Editor }) {
  const handleHeading = (levelParam: number) => {
    const level = levelParam as Level;
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const headingLevels = [
    { level: 1, Icon: Heading1 },
    { level: 2, Icon: Heading2 },
    { level: 3, Icon: Heading3 },
    { level: 4, Icon: Heading4 },
    { level: 5, Icon: Heading5 },
    { level: 6, Icon: Heading6 },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Toggle
          value='headings'
          aria-label='Headings'
          className={cn('', {
            'bg-accent': headingLevels.some(({ level }) =>
              editor.isActive('heading', { level })
            ),
          })}
        >
          <Heading className='h-4 w-4' />
        </Toggle>
      </PopoverTrigger>
      <PopoverContent className='w-full'>
        {headingLevels.map(({ level, Icon }) => (
          <Toggle
            key={level}
            value={`heading${level}`}
            aria-label={`Toggle heading ${level}`}
            className={cn('flex justify-between w-full', {
              'bg-accent': editor.isActive('heading', { level }),
            })}
            onClick={() => handleHeading(level)}
          >
            Heading {level}
            <Icon className='h-4 w-4' />
          </Toggle>
        ))}
      </PopoverContent>
    </Popover>
  );
}
