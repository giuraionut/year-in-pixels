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
import { Mood, Pixel } from '@prisma/client';
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
import { addUserPixel, deleteUserPixel } from '../actions/pixelActions';
import calendarUtils from '../lib/calendarUtils';
import { AddPixelDialogProps } from './Pixels.type';
import { CircleX } from 'lucide-react';

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
  const [userMood, setUserMood] = useState<Mood | null>(null); // Track userMood separately
  const pixel = pixels.find((pixel) => pixel.day === day.dayIndex);
  const FormSchema = z.object({
    mood: z.string({ required_error: 'Please select a mood.' }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  useEffect(() => {
    if (!pixel) {
      setUserMood(null);
      form.reset();
    } else {
      const mood = userMoods.find((mood) => mood.id === pixel.mood.id);
      setUserMood(mood || null);
    }
  }, [day, pixel, userMoods, form]);

  useEffect(() => {
    const fetchUserMoods = async () => {
      const moods = await getUserMoods();
      if (moods) {
        setUserMoods(moods);
        setLoading(false);
      }
    };

    fetchUserMoods();
  }, []);

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
          toast({
            title: 'Pixel created successfully!.',
          });
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

  function getPlaceholder() {
    return userMood ? (
      <div className='flex gap-3 items-center'>
        <div
          className='h-4 w-4 rounded-md'
          style={{
            backgroundColor: userMood.color,
          }}
        ></div>
        <span>{userMood.name}</span>
      </div>
    ) : (
      'Select a mood'
    );
  }

  const handleDeletePixel = async () => {
    const deletedPixel = await deleteUserPixel(pixel as Pixel);
    if (deletedPixel) {
      setPixels((prevPixels) =>
        prevPixels.filter((p) => p.id !== deletedPixel.id)
      );
      toast({
        title: 'Pixel deleted successfully!',
      });

      setUserMood(null); // Clear the userMood when the pixel is deleted
      form.resetField('mood'); // Reset form value
    }
  };

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
                    <div className='grid gap-4 py-4'>
                      <div className='grid grid-cols-4 items-center gap-x-4 gap-y-1'>
                        <Skeleton className='h-4 w-[35px] justify-self-end' />
                        <Skeleton className='h-8 w-[180px]' />
                        <Skeleton className='h-2 w-[180px] col-start-2 col-span-2' />
                      </div>
                    </div>
                  ) : userMoods.length > 0 ? (
                    <div className='grid gap-4 py-4'>
                      <div className='grid grid-cols-4 items-center gap-x-4 gap-y-1'>
                        <FormLabel
                          htmlFor='mood'
                          className='text-right col-span-1'
                        >
                          Mood
                        </FormLabel>
                        <div className='col-span-2'>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            name="select-mood"
                          >
                            <FormControl>
                              <SelectTrigger
                                id='mood'
                                className='w-[180px] capitalize'
                              >
                                <SelectValue placeholder={getPlaceholder()} />
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
                                    <div
                                      className='h-4 w-4 rounded-md'
                                      style={{
                                        backgroundColor: userMood.color,
                                      }}
                                    ></div>
                                    <span>{userMood.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {userMood ? (
                          <CircleX
                            className='col-span-1 cursor-pointer transition-transform hover:scale-125'
                            onClick={handleDeletePixel}
                          />
                        ) : (
                          ''
                        )}

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
