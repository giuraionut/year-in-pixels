import { useState } from 'react';
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
import { ConfirmDeleteEventModalProps } from './event';
import { deleteUserEvent, deleteUserEventsBulk } from '@/actions/eventActions';
import { toast } from 'sonner';

export default function ConfirmDeleteEventModal({
  events,
  event,
  setUserEvents,
  children,
}: ConfirmDeleteEventModalProps) {
  const [open, setOpen] = useState(false);

  const handleConfirmDelete = async () => {
    if (event) {
      const deletedEvent = await deleteUserEvent(event.id);

      if (deletedEvent) {
        setUserEvents((prevEvents) =>
          prevEvents.filter((prevEvent) => prevEvent.id !== event.id)
        );
        toast.success('Event deleted successfully!');
      } else {
        toast.error('Error', {
          description: 'There was an error, please try again!',
        });
      }
    }
    if (events) {
      const selectedEventsIds = events.map((event) => event.id);

      const deletedUserEvents = await deleteUserEventsBulk(selectedEventsIds);
      if (deletedUserEvents) {
        setUserEvents((prevEvents) =>
          prevEvents.filter((item) => !selectedEventsIds.includes(item.id))
        );
        toast.success('Events deleted successfully!');
      } else {
        toast.error('Error', {
          description: 'There was an error, please try again!',
        });
      }
    }

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {event && 'Are you sure you want to delete this event?'}
            {events && 'Are you sure you want to all the selected evemts?'}
          </DialogTitle>
          <DialogDescription>
            {event && 'Pixels associated with it will be deleted as well.'}
            {events && 'Pixels associated with them will be deleted as well.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant='outline'>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} variant='destructive'>
            Yes, delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
