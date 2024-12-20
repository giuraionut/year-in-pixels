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
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Code,
  Code2,
  Eraser,
  Ellipsis,
} from 'lucide-react';
import { Editor } from '@tiptap/react';

export default function ToolbarFormatting({ editor }: { editor: Editor }) {
  const toggleMark = (mark: string) => {
    editor.chain().focus().toggleMark(mark).run();
  };

  const clearFormatting = () => {
    editor.chain().focus().unsetAllMarks().run();
  };

  const toggleCodeBlock = () => {
    editor.chain().focus().toggleCodeBlock().run();
  };

  const formattingOptions = [
    {
      name: 'bold',
      popover: false,
      Icon: Bold,
      action: () => toggleMark('bold'),
    },
    {
      name: 'italic',
      popover: false,
      Icon: Italic,
      action: () => toggleMark('italic'),
    },
    {
      name: 'underline',
      popover: false,
      Icon: UnderlineIcon,
      action: () => toggleMark('underline'),
    },
    {
      name: 'strikethrough',
      popover: true,
      Icon: Strikethrough,
      action: () => toggleMark('strike'),
    },
    {
      name: 'code',
      popover: true,
      Icon: Code,
      action: () => toggleMark('code'),
    },
    {
      name: 'code block',
      popover: true,
      Icon: Code2,
      action: () => toggleCodeBlock(),
    },
    {
      name: 'clear formatting',
      popover: true,
      Icon: Eraser,
      action: () => clearFormatting(),
    },
  ];

  return (
    <div className='flex flex-wrap'>
      <div className='flex'>
        {formattingOptions.map(
          ({ name, popover, Icon, action }) =>
            !popover && (
              <Toggle
                key={name}
                value={name}
                aria-label={`Toggle ${name}`}
                className={cn('flex justify-between w-full', {
                  'bg-accent': editor.isActive(name),
                })}
                onClick={action}
              >
                <Icon className='h-4 w-4' />
              </Toggle>
            )
        )}
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Toggle
            value='more-formatting-options'
            aria-label='More formatting options'
            className={cn('', {
              'bg-accent':
                formattingOptions.some(({ name }) => editor.isActive(name)) ||
                editor.isActive('codeBlock'),
            })}
          >
            <Ellipsis className='h-4 w-4' />
          </Toggle>
        </PopoverTrigger>
        <PopoverContent className='w-full'>
          {formattingOptions.map(
            ({ name, popover, Icon, action }) =>
              popover && (
                <Toggle
                  key={name}
                  value={name}
                  aria-label={`Toggle ${name}`}
                  className={cn('flex justify-between w-full', {
                    'bg-accent': editor.isActive(name),
                  })}
                  onClick={action}
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                  <Icon className='h-4 w-4' />
                </Toggle>
              )
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
