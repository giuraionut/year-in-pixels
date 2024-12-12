'use client';
import { Button } from '@/components/ui/button';
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormEvent, useState } from 'react';
import { EditMoodDialogProps } from './Moods.types';
import { editUserMood } from '@/actions/moodActions';
import { ColorPickerForm } from '@/components/color-picker-form';

export default function EditMoodDialog({
  mood,
  children,
  setUserMoods,
}: EditMoodDialogProps) {
  const [open, setOpen] = useState(false);

  const handleEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    mood.name = String(formData.get('name') ?? '');
    mood.color = JSON.parse(formData.get('color') as string);

    const newUserMood = await editUserMood(mood);

    if (newUserMood) {
      setUserMoods((prevMoods) =>
        prevMoods.map((item) =>
          item.id === newUserMood.id ? newUserMood : item
        )
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Edit mood</DialogTitle>
          <DialogDescription>
            {` Here, you can edit the selected mood. Click save when you're done.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEdit}>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='name' className='text-right'>
                Name
              </Label>
              <Input
                id='name'
                name='name'
                defaultValue={mood.name}
                placeholder={mood.name}
                className='col-span-3'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='color' className='text-right'>
                Color
              </Label>
              <ColorPickerForm defaultColor={mood.color} />
            </div>
          </div>
          <DialogFooter>
            <Button type='submit'>Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
