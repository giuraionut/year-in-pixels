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
import { deleteUserMood, deleteUserMoodsBulk } from '@/actions/moodActions';
import { toast } from '@/hooks/use-toast';
import { DeleteMoodModalProps } from './mood';

const DeleteMoodModal = ({
  moods,
  mood,
  setUserMoods,
  children,
}: DeleteMoodModalProps) => {
  const [open, setOpen] = useState(false);

  const handleConfirmDelete = async () => {
    if (mood) {
      const deletedMood = await deleteUserMood(mood);

      if (deletedMood) {
        toast({ title: 'There was an error, please try again!' });
      } else {
        toast({ title: 'There was an error, please try again!' });
      }
    }
    if (moods) {
      const selectedMoodsIds = moods.map((mood) => mood.id);

      const deletedUserMoods = await deleteUserMoodsBulk(selectedMoodsIds);
      if (deletedUserMoods) {
        setUserMoods((prevMoods) =>
          prevMoods.filter((item) => !selectedMoodsIds.includes(item.id))
        );
        toast({ title: 'Moods deleted successfully!' });
      } else {
        toast({ title: 'There was an error, please try again!' });
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
            {mood && 'Are you sure you want to delete this mood?'}
            {moods && 'Are you sure you want to all the selected moods?'}
          </DialogTitle>
          <DialogDescription>
            {mood && 'Pixels associated with it will be deleted as well.'}
            {moods && 'Pixels associated with them will be deleted as well.'}
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
};

export default DeleteMoodModal;
