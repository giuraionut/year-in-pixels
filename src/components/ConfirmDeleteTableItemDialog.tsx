'use client'; // Needs to be a client component for state and dialog interaction

import React, { useState, useTransition, ReactNode } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSelectedItems } from './SelectedTableItemsContext';

type ItemWithId = { id: string };

type ConfirmDeleteTableItemDialogProps<TData extends ItemWithId> = {
  item?: TData;
  items?: TData[];
  children: ReactNode;
  onDelete?: (
    selectedId: string
  ) => Promise<ServerActionResponse<{ id: string }>>;
  onDeleteBulk?: (
    selectedIds: string[]
  ) => Promise<ServerActionResponse<{ count: number }>>;
  description?: string;
  title?: string;
};

export default function ConfirmDeleteTableItemDialog<TData extends ItemWithId>({
  item,
  items,
  children,
  onDelete,
  onDeleteBulk,
  description,
  title,
}: ConfirmDeleteTableItemDialogProps<TData>) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toggle, clearSelection } = useSelectedItems();
  const isBulkDelete = items && items.length > 0;
  const isSingleDelete = !isBulkDelete && item;

  const handleConfirmDelete = async () => {
    startTransition(async () => {
      try {
        if (isSingleDelete && onDelete && item) {
          const result = await onDelete(item.id);

          if (result.success) {
            toast.success('Item deleted successfully!');
            setOpen(false);
            toggle(item.id);
          } else {
            toast.error('Deletion Failed', {
              description: result.error || 'An unknown error occurred.',
            });
          }
        } else if (isBulkDelete && onDeleteBulk && items) {
          const selectedIds = items.map((i) => i.id);
          if (selectedIds.length === 0) {
            toast.info('No items selected for deletion.');
            setOpen(false);
            return;
          }

          const result = await onDeleteBulk(selectedIds);

          if (result.success) {
            toast.success(`${result.data.count} item(s) deleted successfully!`);
            setOpen(false);
            clearSelection();
          } else {
            toast.error('Bulk Deletion Failed', {
              description: result.error || 'An unknown error occurred.',
            });
          }
        } else {
          console.error(
            "ConfirmDeleteDialog: Invalid props configuration. Need 'item' and 'onDelete' OR 'items' and 'onDeleteBulk'."
          );
          toast.error('Configuration error. Cannot perform delete operation.');
        }
      } catch (error) {
        console.error('ConfirmDeleteDialog error:', error);
        toast.error('An unexpected error occurred', {
          description: 'Please check the console or try again.',
        });
      }
    });
  };

  const dialogTitle =
    title ??
    (isBulkDelete
      ? `Delete ${items?.length} selected item(s)?`
      : isSingleDelete
      ? 'Delete this item?'
      : 'Confirm Deletion');

  const dialogDescription =
    description ??
    (isBulkDelete || isSingleDelete
      ? 'This action cannot be undone.'
      : 'Please confirm you want to proceed.');

  const cannotDelete =
    (!isSingleDelete || !onDelete) && (!isBulkDelete || !onDeleteBulk);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          {dialogDescription && (
            <DialogDescription>{dialogDescription}</DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => setOpen(false)}
            variant='outline'
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant='destructive'
            disabled={isPending || cannotDelete}
          >
            {isPending ? 'Deleting...' : 'Yes, delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
