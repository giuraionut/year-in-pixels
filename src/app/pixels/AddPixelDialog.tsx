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
import { AddPixelDialogProps } from './Pixels.type';
import { CircleX } from 'lucide-react';
import { getUserMoods } from '@/actions/moodActions';
import { addUserPixel, deleteUserPixel } from '@/actions/pixelActions';
import React from 'react';

export default function AddPixelDialog({
  date,
  open,
  setOpen,
  setPixels,
  pixels,
}: Readonly<AddPixelDialogProps>) {
  const [userMoods, setUserMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userMood, setUserMood] = useState<Mood | null>(null); // Track userMood separately
  const pixel = pixels.find(
    (pixel) => pixel.pixelDate.getDate() === date.getDate()
  );
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
  }, [date, pixel, userMoods, form]);

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
    if (data.mood === 'none' && pixel) {
      try {
        const deletedPixel = await deleteUserPixel(pixel as Pixel);
        if (deletedPixel) {
          setPixels((prevPixels) =>
            prevPixels.filter((p) => p.id !== deletedPixel.id)
          );
          toast({
            title: 'Pixel deleted successfully!',
          });

          setUserMood(null);
          form.resetField('mood');
        }
      } catch (error) {
        console.log(error);
        toast({
          title: 'Error',
          description: 'Could not delete pixel. Please try again.',
        });
      }
    }

    if (date && data.mood !== 'none') {
      const pixel = {
        pixelDate: date,
        moodId: data.mood,
        createdAt: new Date(),
        id: '',
        userId: '',
      };
      try {
        FormSchema.parse(pixel);

        const newPixel = await addUserPixel(pixel);
        if (newPixel) {
          const newPixels = [...pixels.filter((p) => p.id !== newPixel.id)];
          newPixels.push(newPixel);
          setPixels(newPixels);
          setOpen(false);
          toast({
            title: 'Pixel created successfully!',
          });
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            toast({
              title: 'Input error, verify the data',
              description: err.message,
              variant: 'destructive',
            });
          });
        } else {
          toast({
            title: 'Error',
            description: 'Could not add pixel. Please try again.',
          });
        }
      }
    }
    setOpen(false);
  }

  function getPlaceholder() {
    return userMood ? (
      <div className='flex gap-3 items-center'>
        <div
          className='h-4 w-4 rounded-md'
          style={{
            backgroundColor: userMood.color.value,
          }}
        ></div>
        <span>{userMood.name}</span>
      </div>
    ) : (
      'Select a mood'
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {/* {day.dayIndex} - {weekdayNames[day.weekdayIndex]} */}
            {date.toLocaleDateString()}
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
                      <div className='grid grid-cols-1 gap-y-2 md:grid-cols-4 md:items-center md:gap-x-2'>
                        <Skeleton className='h-4 text-left md:text-right md:col-span-1 col-span-full max-w-[100px]' />
                        <Skeleton className='h-8 col-span-full md:col-span-3' />
                        <Skeleton className='h-2 col-span-full md:col-start-2 md:col-span-3' />
                      </div>
                    </div>
                  ) : userMoods.length > 0 ? (
                    <div className='grid gap-4 py-4'>
                      <div className='grid grid-cols-1 gap-y-2 md:grid-cols-4 md:items-center md:gap-x-2'>
                        <FormLabel
                          htmlFor='mood'
                          className='text-left md:text-right md:col-span-1 col-span-full'
                        >
                          Mood
                        </FormLabel>

                        <div className='col-span-full md:col-span-3'>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            name='select-mood'
                          >
                            <FormControl>
                              <SelectTrigger
                                id='mood'
                                className='capitalize w-full'
                              >
                                <SelectValue placeholder={getPlaceholder()} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className='overflow-y-auto max-h-[10rem]'>
                              {userMood && (
                                <SelectItem
                                  key='0'
                                  value='none'
                                  className='capitalize'
                                >
                                  <div className='flex gap-3 items-center'>
                                    <div className='h-4 w-4 rounded-md'></div>
                                    <span>None</span>
                                  </div>
                                </SelectItem>
                              )}
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
                                        backgroundColor: userMood.color.value,
                                      }}
                                    ></div>
                                    <span>{userMood.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <FormMessage className='col-span-full md:col-start-2 md:col-span-3' />

                        <FormDescription className='col-span-full md:col-start-2 md:col-span-3'>
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
