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
import { DeleteMoodModalProps } from './mood';
import { toast } from 'sonner';

export default function DeleteMoodModal({
  moods,
  mood,
  setUserMoods,
  children,
}: DeleteMoodModalProps) {
  const [open, setOpen] = useState(false);

  const handleConfirmDelete = async () => {
    if (mood) {
      const deletedMood = await deleteUserMood(mood);

      if (deletedMood) {
        setUserMoods((prevMoods) =>
          prevMoods.filter((item) => item.id !== mood.id)
        );
        toast.success('Mood deleted successfully!');
      } else {
        toast.error('Error', {
          description: 'There was an error, please try again!',
        });
      }
    }
    if (moods) {
      const selectedMoodsIds = moods.map((mood) => mood.id);

      const deletedUserMoods = await deleteUserMoodsBulk(selectedMoodsIds);
      if (deletedUserMoods) {
        setUserMoods((prevMoods) =>
          prevMoods.filter((item) => !selectedMoodsIds.includes(item.id))
        );
        toast.success('Moods deleted successfully!');
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
            {mood && 'Are you sure you want to delete this mood?'}
            {moods && 'Are you sure you want to all the selected moods?'}
          </DialogTitle>
          <DialogDescription>
            {mood && 'You have one or more pixels associated with this mood.'}
            {moods &&
              'You have one or more pixels associated with these moods.'}
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
