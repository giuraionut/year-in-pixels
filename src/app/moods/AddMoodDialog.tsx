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
import { AddMoodDialogProps } from './mood';
import { toast } from '@/hooks/use-toast';
import { addUserMood } from '@/actions/moodActions';
import ColorPickerForm from '@/components/color-picker-form';
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

const FormSchema = z.object({
  name: z.string().min(1, { message: 'Mood name is required' }),
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

export default function AddMoodDialog({
  children,
  setUserMoods,
}: AddMoodDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      color: { name: 'Custom color', value: '#000000' },
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {

    const mood = {
      name: data.name,
      color: data.color,
      userId: '',
      id: '',
      createdAt: new Date(),
    };

    try {
      FormSchema.parse(mood);
      const newMood = await addUserMood(mood);
      if (newMood) {
        setUserMoods((prevMoods) => [...prevMoods, newMood]);
        setOpen(false);
        toast({ title: 'Mood created successfully!' });
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
          description: 'Could not add mood. Please try again later.',
        });
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add new mood</DialogTitle>
          <DialogDescription>
            {`Here, you can add a new mood. Click save when you're done.`}
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
                        htmlFor='mood'
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
              <FormField
                control={form.control}
                name='color'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-1 gap-y-2 md:grid-cols-4 md:items-center md:gap-x-2'>
                      <FormLabel
                        htmlFor='color'
                        className='text-left md:text-right md:col-span-1 col-span-full'
                      >
                        Color
                      </FormLabel>

                      <ColorPickerForm
                        className='col-span-full md:col-span-3'
                        value={field.value || { name: '', value: '#000000' }}
                        onChange={(color) => field.onChange(color)}
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
