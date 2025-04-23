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
import { AddEventDialogProps } from './event';
import { addUserEvent } from '@/actions/eventActions';
import { Event } from '@prisma/client';
import { toast } from 'sonner';

const FormSchema = z.object({
  name: z.string().min(1, { message: 'Event name is required' }),
});

export default function AddEventDialog({ children }: AddEventDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const event: Omit<Event, 'id'> = {
      name: data.name,
      userId: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      FormSchema.parse(event);
      const newEvent = await addUserEvent(event);
      if (newEvent) {
        setOpen(false);
        toast.success('Event created successfully!');
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
          description: 'Could not add event. Please try again later.',
        });
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add new event</DialogTitle>
          <DialogDescription>
            {`Here, you can add a new event. Click save when you're done.`}
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
