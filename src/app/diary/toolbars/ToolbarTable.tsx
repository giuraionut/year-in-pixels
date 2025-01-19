'use client';

import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Toggle } from '@/components/ui/toggle';
import { Table } from 'lucide-react';
import { Editor } from '@tiptap/react';

export default function ToolbarTable({ editor }: { editor: Editor }) {
  const handleCreateTable = (rows: number, cols: number) => {
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Toggle value='table' aria-label='Insert table'>
          <Table />
        </Toggle>
      </PopoverTrigger>
      <PopoverContent className='w-full'>
        {[3, 4, 5].map((size) => (
          <Toggle
            key={size}
            value={`table-${size}x${size}`}
            aria-label={`Create ${size}x${size} table`}
            className='flex justify-between w-full'
            onClick={() => handleCreateTable(size, size)}
          >
            Table{' '}
            <span>
              {size}x{size}
            </span>
          </Toggle>
        ))}
      </PopoverContent>
    </Popover>
  );
}
