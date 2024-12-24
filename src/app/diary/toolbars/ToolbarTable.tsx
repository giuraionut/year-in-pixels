'use client';

import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Toggle } from '@/components/ui/toggle';
import { Table, Trash } from 'lucide-react';
import { Editor } from '@tiptap/react';

export default function ToolbarTable({ editor }: { editor: Editor }) {
  const handleCreateTable = (rows: number, cols: number) => {
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();
  };

  const handleDeleteTable = () => {
    editor.chain().focus().deleteTable().run();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Toggle value='table' aria-label='Insert table'>
          <Table className='h-4 w-4' />
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
        <Toggle
          value='delete-table'
          aria-label='Delete table'
          className='flex justify-between w-full'
          onClick={handleDeleteTable}
        >
          Delete
          <Trash className='h-4 w-4' />
        </Toggle>
      </PopoverContent>
    </Popover>
  );
}
