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
  const colorObj =
    typeof mood.color === 'string' ? JSON.parse(mood.color) : mood.color;

  const moodCustomActions: CustomAction[] = [
    {
      label: `Copy Hex (#${colorObj?.value ?? 'N/A'})`,
      onSelect: () => {
        if (colorObj?.value) {
          navigator.clipboard.writeText(colorObj.value);
        }
      },
      disabled: !colorObj?.value,
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
