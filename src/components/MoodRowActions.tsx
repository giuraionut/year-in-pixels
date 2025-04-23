'use client';

import React from 'react';
import { Mood } from '@prisma/client';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import TableRowActions, { CustomAction } from './TableRowActions';
import EditMoodDialog from '@/app/moods/EditMoodDialog';
import ConfirmDeleteTableItemDialog from './ConfirmDeleteTableItemDialog';
import { deleteUserMood } from '@/actions/moodActions';

type MoodRowActionsProps = {
  mood: Mood;
};

export default function MoodRowActions({ mood }: MoodRowActionsProps) {
  const moodCustomActions: CustomAction[] = [
    {
      label: `Copy Hex (#${mood.color?.value ?? 'N/A'})`,
      onSelect: () => {
        if (mood.color?.value) {
          navigator.clipboard.writeText(mood.color.value);
        }
      },
      disabled: !mood.color?.value,
    },
  ];

  return (
    <TableRowActions<Mood>
      item={mood}
      label='Mood Actions'
      customActions={moodCustomActions}
      renderEditTrigger={(item) => (
        <EditMoodDialog mood={item}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            Edit Mood
          </DropdownMenuItem>
        </EditMoodDialog>
      )}
      renderDeleteTrigger={(item) => (
        <ConfirmDeleteTableItemDialog item={item} onDelete={deleteUserMood}>
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className='text-destructive focus:text-destructive'
          >
            Delete Mood
          </DropdownMenuItem>
        </ConfirmDeleteTableItemDialog>
      )}
    />
  );
}
