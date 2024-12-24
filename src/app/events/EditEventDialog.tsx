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
import { useState } from 'react';
import { EditEventDialogProps } from './event';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import React from 'react';
import { editUserEvent } from '@/actions/eventActions';

const FormSchema = z.object({
  name: z.string().min(1, { message: 'Event name is required' }),
  color: z
    .object({
      name: z.string().min(1),
      value: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, { message: 'Invalid color value' }),
    })
    .refine((data) => data.name.length > 0 && data.value.length === 7, {
      message: 'Invalid color data',
    }),
});

export default function EditEventDialog({
  event,
  children,
  setUserEvents,
}: EditEventDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: event.name,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    (data);

    const eventData = event;
    event.name = data.name;

    try {
      FormSchema.parse(eventData);
      const newEvent = await editUserEvent(eventData);
      if (newEvent) {
        setUserEvents((prevEvents) =>
          prevEvents.map((prevEvent) =>
            prevEvent.id === newEvent.id ? newEvent : prevEvent
          )
        );
        setOpen(false);
        toast({ title: 'Event changed successfully!' });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast({
            title: 'Input error, verify the data',
            description: err.message,
          });
        });
      } else {
        toast({
          title: 'Error',
          description: 'Could not modify the event. Please try again later.',
        });
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Edit {event.name} event</DialogTitle>
          <DialogDescription>
            {`Here, you can edit the event "${event.name}". Click save when you're done.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='grid gap-4 py-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-1 gap-y-2 md:grid-cols-4 md:items-center md:gap-x-2'>
                      <FormLabel
                        htmlFor='event'
                        className='text-left md:text-right md:col-span-1 col-span-full'
                      >
                        Name
                      </FormLabel>
                      <Input
                        className='col-span-full md:col-span-3'
                        {...field}
                      />
                      <FormMessage className='col-span-full md:col-start-2 md:col-span-3' />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type='submit'>Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
