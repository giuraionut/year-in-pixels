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
import { ColorPickerForm } from '../components/color-picker-form';
import { FormEvent, useState } from 'react';
import { Mood } from '@prisma/client';
import { addUserMood } from '../actions/moodActions';
import { AddMoodDialogProps } from './Moods.types';

export default function MoodDialog({
  children,
  setUserMoods,
}: AddMoodDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const mood: Mood = {
      name: String(formData.get('name') ?? ''),
      color: String(formData.get('color') ?? ''),
      userId: '',
      id: '',
      createdAt: new Date(),
    };

    const newMood = await addUserMood(mood);

    if (newMood) {
      setUserMoods((prevMoods) => [...prevMoods, newMood]);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add new mood</DialogTitle>
          <DialogDescription>
            {` Here, you can add a new mood. Click save when you're done.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave}>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='name' className='text-right'>
                Name
              </Label>
              <Input
                id='name'
                name='name'
                placeholder='Name of the mood, eg. happy, sad'
                className='col-span-3'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='color' className='text-right'>
                Color
              </Label>
              <ColorPickerForm />
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
