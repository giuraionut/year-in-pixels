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
import { Mood, Event } from '@prisma/client';
import { Skeleton } from '@/components/ui/skeleton';
import { z } from 'zod';
import { ControllerRenderProps, useForm } from 'react-hook-form';
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
import { AddPixelDialogProps } from './pixel';
import { getUserMoods } from '@/actions/moodActions';
import { upsertUserPixel } from '@/actions/pixelActions';
import React from 'react';
import { format } from 'date-fns';
import { getUserEvents } from '@/actions/eventActions';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

export type FormSchema = {
  moodId: string;
  eventIds: string[];
};
export default function AddPixelDialog({
  date,
  open,
  setOpen,
  setPixels,
  pixels,
}: Readonly<AddPixelDialogProps>) {
  const [userMoods, setUserMoods] = useState<Mood[]>([]);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const pixel = pixels.find(
    (pixel) => pixel.pixelDate.getDate() === date.getDate()
  );

  const FormSchema = z.object({
    moodId: z
      .string()
      .min(1, { message: 'Mood is mandatory, please select one.' }),
    eventIds: z.array(z.string()).optional(),
  });

  const form = useForm<FormSchema>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      moodId: '',
      eventIds: [],
    },
  });

  useEffect(() => {
    if (!pixel) {
      setSelectedMood(null);
      setSelectedEvents([]);
      form.reset();
    } else {
      const mood = pixel.mood
        ? userMoods.find((m) => m.id === pixel.moodId)
        : null;

      setSelectedMood(mood);
      if (mood) {
        form.setValue('moodId', mood.id);
      } else {
        form.setValue('moodId', '');
      }

      const events = pixel.events
        ? userEvents.filter((e) => pixel.eventIds.includes(e.id))
        : [];
      setSelectedEvents(events);
      if (events.length > 0) {
        form.setValue(
          'eventIds',
          events.map((e: Event) => e.id)
        );
      } else {
        form.setValue('eventIds', []);
      }
    }
  }, [date, pixel, userMoods, userEvents, form]);

  useEffect(() => {
    const fetchData = async () => {
      const [moods, events] = await Promise.all([
        getUserMoods(),
        getUserEvents(),
      ]);
      setUserMoods(moods || []);
      setUserEvents(events || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log(selectedEvents);
  }, [selectedEvents]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const moodId = data.moodId || null;
    const eventIds = data.eventIds || [];
    console.log('moodId', moodId);

    if (date) {
      const pixel = {
        pixelDate: date,
        moodId,
        eventIds: eventIds || [],
        createdAt: new Date(),
        id: '',
        userId: '',
      };

      try {
        FormSchema.parse({ moodId, eventIds });
        pixel.moodId = pixel.moodId === 'reset' ? null : pixel.moodId;
        const newPixel = await upsertUserPixel(pixel);
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

  function getMoodPlaceholder() {
    return selectedMood ? (
      <div className='flex gap-3 items-center'>
        <div
          className='h-4 w-4 rounded-md'
          style={{
            backgroundColor: selectedMood.color.value,
          }}
        ></div>
        <span>{selectedMood.name}</span>
      </div>
    ) : (
      'Select a mood'
    );
  }

  function getEventPlaceholder() {
    return selectedEvents ? (
      <span className='flex gap-3 items-center justify-between w-full'>
        <span>
          {selectedEvents.length === 0
            ? 'Select an event'
            : selectedEvents.length === 1
            ? selectedEvents[0].name
            : `${selectedEvents.length} events selected`}
        </span>
        <span>
          <ChevronDown />
        </span>
      </span>
    ) : (
      <span className='flex gap-3 items-center justify-between w-full'>
        <span>Select an event</span>
        <span>
          <ChevronDown />
        </span>
      </span>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{format(date, 'PPP')}</DialogTitle>
          <DialogDescription>
            {`Make changes to your day here. Click save when you're done.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Mood Selection */}
            <FormField
              control={form.control}
              name='moodId'
              render={({ field }) => (
                <FormItem>
                  {loading ? (
                    <SkeletonLoading />
                  ) : userMoods.length > 0 ? (
                    <MoodSelection
                      field={field}
                      userMoods={userMoods}
                      getPlaceholder={getMoodPlaceholder}
                    />
                  ) : (
                    <EmptyMessage type='moods' />
                  )}
                </FormItem>
              )}
            />

            {/* Event Selection */}
            <FormField
              control={form.control}
              name='eventIds'
              render={({ field }) =>
                field && (
                  <FormItem>
                    {loading ? (
                      <SkeletonLoading />
                    ) : userEvents.length > 0 ? (
                      <EventSelection
                        field={field}
                        userEvents={userEvents}
                        getEventPlaceholder={getEventPlaceholder}
                      />
                    ) : (
                      <EmptyMessage type='events' />
                    )}
                  </FormItem>
                )
              }
            />
            <DialogFooter>
              <Button type='submit'>Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  function SkeletonLoading() {
    return (
      <div className='grid gap-4 py-4'>
        <div className='grid grid-cols-1 gap-y-2 md:grid-cols-4 md:items-center md:gap-x-2'>
          <Skeleton className='h-4 text-left md:text-right md:col-span-1 col-span-full max-w-[100px]' />
          <Skeleton className='h-8 col-span-full md:col-span-3' />
          <Skeleton className='h-2 col-span-full md:col-start-2 md:col-span-3' />
        </div>
      </div>
    );
  }

  /* Component for mood selection */
  function MoodSelection({
    field,
    userMoods,
    getPlaceholder,
  }: {
    field: ControllerRenderProps<FormSchema, 'moodId'>;
    userMoods: Mood[];
    getPlaceholder: () => JSX.Element | string;
  }) {
    return (
      <div className='grid gap-4 py-4'>
        <div className='grid grid-cols-1 gap-y-2 md:grid-cols-4 md:items-center md:gap-x-2'>
          <FormLabel
            htmlFor='mood'
            className='text-left md:text-right md:col-span-1 col-span-full'
          >
            Mood
          </FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger
                id='mood'
                className='capitalize w-full md:col-span-3'
              >
                <SelectValue placeholder={getPlaceholder()} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className='overflow-y-auto max-h-[10rem]'>
              <MoodOptions userMoods={userMoods} />
            </SelectContent>
          </Select>
          <div className='col-span-full md:col-span-3 md:col-start-2'>
            <FormMessage />
            <FormDescription>Select a mood for this day.</FormDescription>
          </div>
        </div>
      </div>
    );
  }

  /* Component for displaying mood options */
  function MoodOptions({ userMoods }: { userMoods: Mood[] }) {
    return (
      <>
        {selectedMood && (
          <SelectItem key='0' value='reset' className='capitalize'>
            <div className='flex gap-3 items-center'>
              <div className='h-4 w-4 rounded-md'></div>
              <span>Reset</span>
            </div>
          </SelectItem>
        )}
        {userMoods.map((mood) => (
          <SelectItem key={mood.id} value={mood.id} className='capitalize'>
            <div className='flex gap-3 items-center'>
              <div
                className='h-4 w-4 rounded-md'
                style={{
                  backgroundColor: mood.color.value,
                }}
              ></div>
              <span>{mood.name}</span>
            </div>
          </SelectItem>
        ))}
      </>
    );
  }

  /* Event Selection Component with Multi-Select Dropdown */
  function EventSelection({
    field,
    userEvents,
    getEventPlaceholder,
  }: {
    field: ControllerRenderProps<FormSchema, 'eventIds'>;
    userEvents: Event[];
    getEventPlaceholder: () => JSX.Element | string;
  }) {
    const handleEventToggle = (eventId: string) => {
      const updatedEvents = field.value.includes(eventId)
        ? field.value.filter((id: string) => id !== eventId)
        : [...field.value, eventId];
      field.onChange(updatedEvents);

      const events = userEvents.filter((e) => updatedEvents.includes(e.id));
      setSelectedEvents(events);
    };

    return (
      <div className='grid gap-4 py-4'>
        <div className='grid grid-cols-1 gap-y-2 md:grid-cols-4 md:items-center md:gap-x-2'>
          <FormLabel
            htmlFor='event'
            className='text-left md:text-right md:col-span-1 col-span-full'
          >
            Events
          </FormLabel>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                className='capitalize w-full md:col-span-3'
              >
                {getEventPlaceholder()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='max-h-60 overflow-y-auto'>
              {userEvents.map((event) => (
                <DropdownMenuCheckboxItem
                  key={event.id}
                  checked={field.value.includes(event.id)}
                  onCheckedChange={() => handleEventToggle(event.id)}
                >
                  {event.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className='col-span-full md:col-span-3 md:col-start-2'>
            <FormMessage />
            <FormDescription>
              Select one or more events for this day.
            </FormDescription>
          </div>
        </div>
      </div>
    );
  }

  function EmptyMessage({ type }: { type: 'moods' | 'events' }) {
    return (
      <div className='grid gap-4 py-4'>
        <div className='grid grid-cols-1 gap-y-2 md:grid-cols-4 md:items-center md:gap-x-2'>
          <FormLabel
            htmlFor={type}
            className='text-left md:text-right md:col-span-1 col-span-full'
          >
            {type === 'moods' ? 'Mood' : 'Event'}
          </FormLabel>
          <div className='col-span-full md:col-span-3'>
            <Link href={type === 'moods' ? '/moods' : '/events'}>
              <Button
                variant='link'
                className='text-left p-0 hover:underline text-primary pl-0 capitalize'
              >
                Add a {type === 'moods' ? 'mood' : 'event'} first.
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
