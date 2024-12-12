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
import { deleteUserMood, deleteUserMoodsBulk } from '@/actions/moodActions'; // Backend function
import { Mood } from '@prisma/client';
import { toast } from '@/hooks/use-toast';

type DeleteMoodModalProps = {
  setUserMoods: React.Dispatch<React.SetStateAction<Mood[]>>;
  children: React.ReactNode;
} & (
  | { mood: Mood; moods?: never } // If mood is provided, moods cannot be provided
  | { moods: Mood[]; mood?: never }
); // If moods is provided, mood cannot be provided

const DeleteMoodModal = ({
  moods,
  mood,
  setUserMoods,
  children,
}: DeleteMoodModalProps) => {
  const [open, setOpen] = useState(false);

  const handleConfirmDelete = async () => {
    if (mood) {
      const { deletedMood, error } = await deleteUserMood(mood);

      if (error) {
        toast({ title: 'There was an error, please try again!' });
      } else if (deletedMood) {
        setUserMoods((prevMoods) =>
          prevMoods.filter((item) => item.id !== deletedMood.id)
        );
        toast({ title: 'Mood deleted successfully!' });
      }
    }
    if (moods) {
      const selectedMoodsIds = moods.map((mood) => mood.id);

      const { deletedMoods, error } = await deleteUserMoodsBulk(
        selectedMoodsIds
      );
      if (error) {
        toast({ title: 'There was an error, please try again!' });
      } else if (deletedMoods) {
        setUserMoods((prevMoods) =>
          prevMoods.filter((item) => !selectedMoodsIds.includes(item.id))
        );
        toast({ title: 'Moods deleted successfully!' });
      }
    }

    setOpen(false); // Close the modal after the operation
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
