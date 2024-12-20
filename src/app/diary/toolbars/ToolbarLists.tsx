'use client';

import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';
import { List, ListOrdered, ListTodo } from 'lucide-react';

import { Editor } from '@tiptap/react';
import { ListBulletIcon } from '@radix-ui/react-icons';

export default function ToolbarLists({ editor }: { editor: Editor }) {
  const toggleList = (type: string) => {
    editor.chain().focus().toggleList(type, 'listItem').run();
  };

  const listOptions = [
    { name: 'bulletList', Icon: ListBulletIcon },
    { name: 'orderedList', Icon: ListOrdered },
    { name: 'taskList', Icon: ListTodo },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Toggle
          value='lists'
          aria-label='Lists'
          className={cn('', {
            'bg-accent': listOptions.some(({ name }) => editor.isActive(name)),
          })}
        >
          <List className='h-4 w-4' />
        </Toggle>
      </PopoverTrigger>
      <PopoverContent className='w-full'>
        {listOptions.map(({ name, Icon }) => (
          <Toggle
            key={name}
            value={name}
            aria-label={`Toggle ${name}`}
            className={cn('flex justify-between w-full', {
              'bg-accent': editor.isActive(name),
            })}
            onClick={() => toggleList(name)}
          >
            {name.replace(/([A-Z])/g, ' $1')}
            <Icon className='h-4 w-4' />
          </Toggle>
        ))}
      </PopoverContent>
    </Popover>
  );
}
