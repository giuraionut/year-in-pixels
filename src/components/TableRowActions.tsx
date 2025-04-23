'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

export type CustomAction = {
  label: string;
  onSelect: () => void;
  isDestructive?: boolean;
  disabled?: boolean;
};

type TableRowActionsProps<TData> = {
  item: TData;
  label?: string;
  customActions?: CustomAction[];
  renderEditTrigger?: (item: TData) => React.ReactNode;
  renderDeleteTrigger?: (item: TData) => React.ReactNode;
};

export default function TableRowActions<TData>({
  item,
  label = 'Actions',
  customActions = [],
  renderEditTrigger,
  renderDeleteTrigger,
}: TableRowActionsProps<TData>) {
  const hasSpecificActions = !!renderEditTrigger || !!renderDeleteTrigger;
  const hasCustomActions = customActions.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <span className='sr-only'>Open menu for item</span>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        {customActions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onSelect={(e) => {
              e.preventDefault(); 
              action.onSelect();
            }}
            className={action.isDestructive ? 'text-destructive focus:text-destructive' : ''}
            disabled={action.disabled}
          >
            {action.label}
          </DropdownMenuItem>
        ))}

        {hasCustomActions && hasSpecificActions && <DropdownMenuSeparator />}
        {renderEditTrigger && renderEditTrigger(item)}
        {renderDeleteTrigger && renderDeleteTrigger(item)}

      </DropdownMenuContent>
    </DropdownMenu>
  );
}