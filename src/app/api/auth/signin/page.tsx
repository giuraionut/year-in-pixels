'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { LoadingDots } from '@/components/icons/loading-dots';
import { signIn, getProviders, ClientSafeProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleIcon } from '@/components/icons/google';
import Link from 'next/link';
import { toast } from 'sonner';

const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormInputs = z.infer<typeof LoginSchema>;

export default function SignIn() {
  const [providers, setProviders] = useState<{
    [key: string]: ClientSafeProvider;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };

    fetchProviders();
  }, []);

  const form = useForm<LoginFormInputs>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setIsSubmitting(true);

    try {
      const res = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        form.setError('email', { message: res.error });
        form.setError('password', { message: ' ' });
        toast.error(res.error);
      } else {
        router.push('/dashboard');
      }
    } catch {
      form.setError('email', {
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!providers) {
    return (
      <div className='h-full flex items-center justify-center'>
        <LoadingDots />
      </div>
    );
  }

  return (
    <div className='container px-6 py-6 mx-auto gap-6 max-w-[400px]'>
      <Card className='p-5 flex flex-col gap-5'>
        <h1 className='scroll-m-20 text-2xl font-semibold tracking-tight text-center'>
          Sign in to Year In Pixels
        </h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-4'
          >
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='email@example.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='Password' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? <LoadingDots /> : 'Sign in with Email'}
            </Button>
          </form>
        </Form>
        <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border'>
          <span className='relative z-10 bg-background px-2 text-muted-foreground'>
            Or continue with
          </span>
        </div>
        <div className='flex flex-col gap-2 mt-4'>
          {Object.values(providers)
            .filter((provider) => provider.id !== 'credentials')
            .map((provider) => (
              <Button key={provider.name} onClick={() => signIn(provider.id)}>
                {provider.id === 'google' && <GoogleIcon />} Sign in with{' '}
                {provider.name}
              </Button>
            ))}
        </div>

        <p className='text-sm text-gray-500 text-center'>
          Don&apos;t have an account yet?{' '}
          <Link href='/api/auth/signup' className='text-blue-500 underline'>
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
