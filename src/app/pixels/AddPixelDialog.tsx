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
import { Mood, Event, PixelToEvent } from '@prisma/client';
import { Skeleton } from '@/components/ui/skeleton';
import { z } from 'zod';
import { ControllerRenderProps, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { toast } from 'sonner';

export type FormSchema = {
  moodIds: string[];
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
  const [selectedMoods, setSelectedMoods] = useState<Mood[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);

  const pixel = pixels.find((pixel) => {
    const isSameDate =
      pixel.pixelDate.getDate() === date.getDate() &&
      pixel.pixelDate.getMonth() === date.getMonth() &&
      pixel.pixelDate.getFullYear() === date.getFullYear();

    return isSameDate;
  });

  const FormSchema = z.object({
    moodIds: z.array(z.string()).optional(),
    eventIds: z.array(z.string()).optional(),
  });

  const form = useForm<FormSchema>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      moodIds: [],
      eventIds: [],
    },
  });

  useEffect(() => {
    if (!pixel) {
      setSelectedMoods([]);
      setSelectedEvents([]);
      form.reset();
    } else {
      // Extract event IDs from the nested pixel.events structure
      const eventIds: string[] = pixel.events.map(
        (pixelToEvent: PixelToEvent) => pixelToEvent.eventId
      );

      // Filter the userEvents to only include those in the current pixel
      const events = userEvents.filter((e) => eventIds.includes(e.id));

      setSelectedEvents(events);
      form.setValue(
        'eventIds',
        events.map((e: Event) => e.id)
      );

      const moodIds: string[] = pixel.moods.map((m: Mood) => m.moodId);

      const moods = userMoods.filter((m) => moodIds.includes(m.id));

      setSelectedMoods(moods);
      form.setValue(
        'moodIds',
        moods.map((e: Mood) => e.id)
      );
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

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const moodIds = data.moodIds || [];
    const eventIds = data.eventIds || [];

    try {
      if (date) {
        const pixel = {
          pixelDate: date,
          createdAt: new Date(),
          userId: '',
        };
        FormSchema.parse({ moodIds, eventIds });
        const newPixel = await upsertUserPixel(pixel, eventIds, moodIds);
        if (newPixel) {
          const newPixels = [...pixels.filter((p) => p.id !== newPixel.id)];
          newPixels.push(newPixel);
          setPixels(newPixels);
          setOpen(false);
          toast.success('Pixel created successfully!', {
            description: (
              <div>
                {newPixel.moods &&
                  newPixel.moods.length > 0 &&
                  newPixel.moods[0].mood && (
                    <p>
                      Mood:{' '}
                      {newPixel.moods[0].mood.name.charAt(0).toUpperCase() +
                        newPixel.moods[0].mood.name.slice(1)}
                    </p>
                  )}
                {newPixel.events.length > 0 && (
                  <p>
                    Events:{' '}
                    {newPixel.events
                      .map((pixelToEvent: PixelToEvent & { event: Event }) => {
                        if (pixelToEvent.event && pixelToEvent.event.name) {
                          // Check if event exists and has a name
                          return (
                            pixelToEvent.event.name.charAt(0).toUpperCase() +
                            pixelToEvent.event.name.slice(1)
                          );
                        } else {
                          return 'Unknown Event'; // Or some other default value
                        }
                      })
                      .join(', ')}
                  </p>
                )}
              </div>
            ),
          });
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error('Input error, verify the data', {
            description: err.message,
          });
        });
      } else {
        toast.error('Error', {
          description: `Could not add pixel. Please try again. ${error}`,
        });
      }
    } finally {
      setOpen(false);
    }
  }

  function getMoodPlaceholder() {
    return selectedMoods ? (
      <span className='flex gap-3 items-center justify-between w-full'>
        <span>
          {selectedMoods.length === 0 ? (
            'Select a mood'
          ) : selectedMoods.length === 1 ? (
            <div className='flex gap-3 items-center'>
              <div
                className='h-4 w-4 rounded-md'
                style={{
                  backgroundColor: selectedMoods[0].color.value,
                }}
              ></div>
              <span>{selectedMoods[0].name}</span>
            </div>
          ) : (
            `${selectedMoods.length} moods selected`
          )}
        </span>
        <span>
          <ChevronDown />
        </span>
      </span>
    ) : (
      <span className='flex gap-3 items-center justify-between w-full'>
        <span>Select a mood</span>
        <span>
          <ChevronDown />
        </span>
      </span>
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
              name='moodIds'
              render={({ field }) =>
                field && (
                  <FormItem>
                    {loading ? (
                      <SkeletonLoading />
                    ) : userMoods.length > 0 ? (
                      <MoodSelection
                        field={field}
                        userMoods={userMoods}
                        getMoodPlaceholder={getMoodPlaceholder}
                      />
                    ) : (
                      <EmptyMessage type='moods' />
                    )}
                  </FormItem>
                )
              }
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
    getMoodPlaceholder,
  }: {
    field: ControllerRenderProps<FormSchema, 'moodIds'>;
    userMoods: Mood[];
    getMoodPlaceholder: () => JSX.Element | string;
  }) {
    const handleMoodToggle = (moodId: string) => {
      const updatedMoods = field.value.includes(moodId)
        ? field.value.filter((id: string) => id !== moodId)
        : [...field.value, moodId];
      field.onChange(updatedMoods);

      const moods = userMoods.filter((m) => updatedMoods.includes(m.id));
      setSelectedMoods(moods);
    };

    return (
      <div className='grid gap-4 py-4'>
        <div className='grid grid-cols-1 gap-y-2 md:grid-cols-4 md:items-center md:gap-x-2'>
          <FormLabel
            htmlFor='mood'
            className='text-left md:text-right md:col-span-1 col-span-full'
          >
            Mood
          </FormLabel>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                className='capitalize w-full md:col-span-3'
              >
                {getMoodPlaceholder()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='max-h-60 overflow-y-auto'>
              {userMoods.map((mood) => (
                <DropdownMenuCheckboxItem
                  key={mood.id}
                  checked={field.value.includes(mood.id)}
                  onCheckedChange={() => handleMoodToggle(mood.id)}
                  className='flex gap-2'
                >
                  <div
                    className='h-4 w-4 rounded-md'
                    style={{
                      backgroundColor: mood.color?.value || '#FFFFFF',
                    }}
                  ></div>
                  {mood.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className='col-span-full md:col-span-3 md:col-start-2'>
            <FormMessage />
            <FormDescription>
              Select one or more moods for this day.
            </FormDescription>
          </div>
        </div>
      </div>
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
                className='text-left p-0 hover:underline hover:pointer text-primary pl-0'
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
