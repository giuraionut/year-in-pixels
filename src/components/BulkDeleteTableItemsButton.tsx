'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { useSelectedItems } from './SelectedTableItemsContext';
import ConfirmDeleteTableItemDialog from './ConfirmDeleteTableItemDialog';

type BulkDeleteTableItemsButtonProps = {
  onDeleteBulkAction: (
    selectedIds: string[]
  ) => Promise<ServerActionResponse<{ count: number }>>;
};

export default function BulkDeleteTableItemsButton({
  onDeleteBulkAction, // Use the renamed prop
}: BulkDeleteTableItemsButtonProps) {
  const { selected } = useSelectedItems();

  if (selected.size === 0) return null;

  const itemsToPassToDialog = Array.from(selected).map((id) => ({ id }));

  return (
    <div className='flex justify-end py-4'>
      <ConfirmDeleteTableItemDialog
        items={itemsToPassToDialog}
        onDeleteBulk={onDeleteBulkAction}
        title={`Delete ${selected.size} selected item(s)?`}
        description='This action cannot be undone.'
      >
        <Button variant='destructive' disabled={selected.size === 0}>
          {`Delete ${selected.size} selected`}
        </Button>
      </ConfirmDeleteTableItemDialog>
    </div>
  );
}
