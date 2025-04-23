'use client';

import React from 'react';
import { Event } from '@prisma/client';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import TableRowActions from './TableRowActions';
import EditEventDialog from '@/app/events/EditEventDialog';
import ConfirmDeleteTableItemDialog from './ConfirmDeleteTableItemDialog';
import { deleteUserEvent } from '@/actions/eventActions';

type EventRowActionsProps = {
  event: Event;
};

export default function EventRowActions({ event }: EventRowActionsProps) {
  return (
    <TableRowActions<Event>
      item={event}
      label='Event Actions'
      renderEditTrigger={(item) => (
        <EditEventDialog event={item}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            Edit Event
          </DropdownMenuItem>
        </EditEventDialog>
      )}
      renderDeleteTrigger={(item) => (
        <ConfirmDeleteTableItemDialog item={item} onDelete={deleteUserEvent}>
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className='text-destructive focus:text-destructive'
          >
            Delete Event
          </DropdownMenuItem>
        </ConfirmDeleteTableItemDialog>
      )}
    />
  );
}
