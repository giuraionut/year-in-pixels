'use client';

import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Mood } from '@prisma/client';
import { getUserMoods } from '../actions/moodActions';
import { Skeleton } from '@/components/ui/skeleton';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { addUserPixel } from '../actions/pixelActions';
import calendarUtils from '../lib/calendarUtils';
import { AddPixelDialogProps } from './Pixels.type';

export default function AddPixelDialog({
  day,
  month,
  year,
  open,
  setOpen,
  setPixels,
  pixels,
}: Readonly<AddPixelDialogProps>) {
  const { weekdayNames } = calendarUtils();
  const [userMoods, setUserMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserMoods = async () => {
      const moods = await getUserMoods();
      setUserMoods(moods);
      setLoading(false);
    };

    fetchUserMoods();
  }, []);

  const FormSchema = z.object({
    mood: z.string({ required_error: 'Please select a mood.' }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (day?.dayIndex && month.index && year) {
      const pixel = {
        day: day.dayIndex,
        month: month.index,
        year,
        moodId: data.mood,
        createdAt: new Date(),
        id: '', // Backend should populate this
        userId: '', // Backend should populate this
      };

      try {
        const newPixel = await addUserPixel(pixel); // Call backend to add pixel
        if (newPixel) {
          const newPixels = [...pixels];
          newPixels.push(newPixel);
          setPixels(newPixels);
          setOpen(false); // Close dialog
        }
      } catch (error) {
        console.error('Failed to add pixel:', error);
        toast({
          title: 'Error',
          description: 'Could not add pixel. Please try again.',
        });
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {day.dayIndex} - {weekdayNames[day.weekdayIndex]}
          </DialogTitle>
          <DialogDescription>
            {`Make changes to your day here. Click save when you're done.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='mood'
              render={({ field }) => (
                <FormItem>
                  {loading ? (
                    <div className='grid grid-cols-4 items-center gap-4'>
                      <Skeleton className='h-4 w-[35px] justify-self-end' />
                      <Skeleton className='h-8 w-[180px]' />
                    </div>
                  ) : userMoods.length > 0 ? (
                    <div className='grid gap-4 py-4'>
                      <div className='grid grid-cols-4 items-center gap-x-4 gap-y-1'>
                        <FormLabel className='text-right'>Mood</FormLabel>
                        <div className='col-span-3'>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger
                                id='mood'
                                className='w-[180px] capitalize'
                              >
                                <SelectValue placeholder='Select a mood' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className='overflow-y-auto max-h-[10rem]'>
                              {userMoods.map((userMood) => (
                                <SelectItem
                                  key={userMood.id}
                                  value={userMood.id}
                                  className='capitalize'
                                >
                                  <div className='flex gap-3 items-center'>
                                    <Button
                                      variant='outline'
                                      className='h-4 w-4 rounded-lg'
                                      style={{
                                        backgroundColor: userMood.color,
                                      }}
                                    ></Button>
                                    <span>{userMood.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <FormMessage className='col-start-2 col-span-2' />
                        <FormDescription className='col-start-2 col-span-2'>
                          <span>
                            Manage your moods{' '}
                            <Link
                              href='/moods'
                              className='underline text-blue-300'
                            >
                              here
                            </Link>
                            .
                          </span>
                        </FormDescription>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {`You don't have any moods yet, create them `}
                      <Link href='/moods' className='underline text-blue-300'>
                        here
                      </Link>
                      .
                    </div>
                  )}
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type='submit'>Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
