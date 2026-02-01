'use client';

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';

import { upsertUserPixel } from '@/actions/pixelActions';
import { Mood, Event, Pixel, MoodToPixel } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { DialogClose } from '@radix-ui/react-dialog';
import { DialogFooter } from '@/components/ui/dialog';

const PixelFormSchema = z.object({
  date: z.string().datetime(),
  moodIds: z.array(z.string()).optional(),
  eventIds: z.array(z.string()).optional(),
});

type PixelFormInput = z.infer<typeof PixelFormSchema>;

// Props for the form component
interface AddPixelDialogFormProps {
  date: Date;
  userMoods: Mood[];
  userEvents: Event[];
  existingPixel: (Pixel & { moods: MoodToPixel[]; events: any[] }) | null;
  onFormSubmit?: () => void;
}

export default function AddPixelDialogForm({
  date,
  userMoods,
  userEvents,
  existingPixel,
  onFormSubmit,
}: AddPixelDialogFormProps) {
  const form = useForm<PixelFormInput>({
    resolver: zodResolver(PixelFormSchema),

    defaultValues: {
      date: date.toISOString(),
      moodIds:
        existingPixel?.moods.map((m: MoodToPixel): string => m.moodId) || [],
      eventIds:
        existingPixel?.events.map(
          (pe: any): string => pe.event.id
        ) || [],
    },
  });
  const { handleSubmit, control, reset } = form;

  const onSubmit = async (data: PixelFormInput) => {
    const result = await upsertUserPixel(
      { pixelDate: new Date(data.date), userId: '' } as any,
      data.eventIds || [],
      data.moodIds || []
    );
    if (result.success) {
      toast.success('Pixel saved successfully!');
      reset();
      if (onFormSubmit) {
        onFormSubmit();
      }
    } else {
      console.error('Failed to save pixel:', result.error);
      toast.error('Failed to save pixel. Please try again.');
    }
  };

  const formattedDate = format(date, 'PPP');

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <p className='text-sm text-muted-foreground'>
          Editing pixel for: {formattedDate}
        </p>

        <fieldset className='grid gap-2 max-h-32 overflow-y-auto pr-2 border p-3 rounded-md'>
          <legend className='font-medium text-sm -ml-1 px-1'>Moods</legend>
          {userMoods.length > 0 ? (
            <Controller
              control={control}
              name='moodIds'
              render={({ field }) => (
                <>
                  {userMoods.map((mood) => (
                    <label
                      key={mood.id}
                      className='flex items-center space-x-2 cursor-pointer'
                    >
                      <Checkbox
                        checked={field.value?.includes(mood.id)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...(field.value || []), mood.id])
                            : field.onChange(
                                field.value?.filter((id) => id !== mood.id)
                              );
                        }}
                      />
                      <span className='text-sm' style={{ color: mood.color }}>
                        {mood.name}
                      </span>
                    </label>
                  ))}
                </>
              )}
            />
          ) : (
            <div className='flex flex-row items-center justify-center py-4 gap-2'>
              <p className='text-sm text-muted-foreground'>No moods found.</p>
              <Button asChild variant='link' size='sm'>
                <Link href='/moods'>Create Moods</Link>
              </Button>
            </div>
          )}
        </fieldset>

        <fieldset className='grid gap-2 max-h-32 overflow-y-auto pr-2 border p-3 rounded-md'>
          <legend className='font-medium text-sm -ml-1 px-1'>Events</legend>
          {userEvents.length > 0 ? (
            <Controller
              control={control}
              name='eventIds'
              render={({ field }) => (
                <>
                  {userEvents.map((event) => (
                    <label
                      key={event.id}
                      className='flex items-center space-x-2 cursor-pointer'
                    >
                      <Checkbox
                        checked={field.value?.includes(event.id)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...(field.value || []), event.id])
                            : field.onChange(
                                field.value?.filter((id) => id !== event.id)
                              );
                        }}
                      />
                      <span className='text-sm'>{event.name}</span>
                    </label>
                  ))}
                </>
              )}
            />
          ) : (
            <div className='flex flex-row items-center justify-center py-4 gap-2'>
              <p className='text-sm text-muted-foreground'>No events found.</p>
              <Button asChild variant='link' size='sm'>
                <Link href='/events'>Create Events</Link>
              </Button>
            </div>
          )}
        </fieldset>

        <DialogFooter className='pt-4'>
          <DialogClose asChild>
            <Button type='button' variant='outline'>
              Cancel
            </Button>
          </DialogClose>
          <Button type='submit' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Save Pixel'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
