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
import { EditMoodDialogProps } from './mood';
import { editUserMood } from '@/actions/moodActions';
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
import { toast } from 'sonner';

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

export default function EditMoodDialog({
  mood,
  children,
}: EditMoodDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: mood.name,
      color: { name: mood.color.name, value: mood.color.value },
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const moodData = mood;
    moodData.name = data.name;
    moodData.color = data.color;

    try {
      FormSchema.parse(moodData);

      const newMood = await editUserMood(moodData);
      if (newMood.success) {
        newMood.data.color = JSON.parse(newMood.data.color);

        setOpen(false);
        toast.success('Mood changed successfully!');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        (error as any).errors.forEach((err: any) => {
          toast.error('Input error, verify the data', {
            description: err.message,
          });
        });
      } else {
        toast.error('Error', {
          description: 'Could not modify the mood. Please try again later.',
        });
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Edit {mood.name} mood</DialogTitle>
          <DialogDescription>
            {`Here, you can edit the mood "${mood.name}". Click save when you're done.`}
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
                        defaultColor={mood.color}
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
