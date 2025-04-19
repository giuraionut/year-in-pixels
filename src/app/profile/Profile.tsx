'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getConnectedProviders, setPassword } from '@/actions/authActions';
import { updateUserImage } from '@/actions/userActions';
import { GoogleIcon } from '@/components/icons/google';
import { IconKeyFilled } from '@tabler/icons-react';
import { backupFilteredDb, backupJSON } from '@/actions/misc';

export default function Profile() {
  const { data: session, update } = useSession();
  const [imageMessage, setImageMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [connectedProviders, setConnectedProviders] = useState<
    { provider: string; createdAt: string }[]
  >([]);
  const [hasPassword, setHasPassword] = useState(false);

  const profileImageForm = useForm({
    resolver: zodResolver(
      z.object({
        url: z
          .string()
          .url('Please enter a valid URL.')
          .regex(
            /\.(jpeg|jpg|gif|png|webp)$/i,
            'URL must point to an image file (e.g., .jpg, .png, .gif, .webp).'
          ),
      })
    ),
    defaultValues: { url: '' },
  });

  const passwordForm = useForm({
    resolver: zodResolver(
      z
        .object({
          currentPassword: z.string().optional(),
          newPassword: z
            .string()
            .min(8, 'Password must be at least 8 characters long.')
            .max(100, 'Password cannot exceed 100 characters.'),
          confirmPassword: z.string(),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
          message: 'Passwords do not match.',
          path: ['confirmPassword'],
        })
        .refine((data) => (hasPassword ? !!data.currentPassword : true), {
          message: 'Current password is required.',
          path: ['currentPassword'],
        })
    ),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (session?.user?.id) {
      (async () => {
        try {
          const response = await getConnectedProviders();
          if (response.success) {
            setConnectedProviders(
              (response.providers || []).map((provider) => ({
                ...provider,
                createdAt:
                  provider.createdAt instanceof Date
                    ? provider.createdAt.toISOString()
                    : provider.createdAt, // Ensure it's a string
              }))
            );
            setHasPassword(response.hasPassword || false);
          }
        } catch (error) {
          console.error('Error fetching connected providers:', error);
        }
      })();
    }
  }, [session]);

  const handleSaveProfileImage = async (data: { url: string }) => {
    try {
      if (session?.user?.id) {
        await updateUserImage(session.user.id, data.url);
        await update({ user: { image: data.url } });
        setImageMessage('Profile image updated successfully.');
      } else {
        setImageMessage('Session is not available. Please log in again.');
      }
    } catch (error) {
      console.error('Error saving profile image:', error);
      setImageMessage('An error occurred while saving the profile image.');
    }
  };

  const handleSetOrChangePassword = async (data: {
    currentPassword?: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      const response = await setPassword({
        email: session?.user?.email || '',
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      if (response.success) {
        setPasswordMessage(
          hasPassword
            ? 'Password changed successfully.'
            : 'Password set successfully.'
        );
        if (!hasPassword) setHasPassword(true);
      } else {
        setPasswordMessage(
          response.message || 'Failed to set/change password.'
        );
      }
    } catch (error) {
      console.error('Error setting/changing password:', error);
      setPasswordMessage('An error occurred. Please try again.');
    }
  };

  const handleBackup = async () => {
    const jsonData = await backupJSON();
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);

    // Automatically trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'year_in_pixels.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a); // Cleanup
    URL.revokeObjectURL(url); // Free memory

    const dbData = await backupFilteredDb();
    if (dbData) {
      const dbBlob = new Blob([dbData], { type: 'application/octet-stream' });
      const dbUrl = URL.createObjectURL(dbBlob);
      const dbAnchor = document.createElement('a');
      dbAnchor.href = dbUrl;
      dbAnchor.download = 'year_in_pixels_filtered.db';
      document.body.appendChild(dbAnchor);
      dbAnchor.click();
      document.body.removeChild(dbAnchor);
      URL.revokeObjectURL(dbUrl);
    }
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div className='relative flex flex-col items-start gap-2'>
      <section
        id='dashboard-header'
        className='flex flex-col items-start border-b border-border/40 py-2 dark:border-border md:py-10 lg:py-12
          bg-background/95 backdrop-blur 
        supports-backdrop-filter:bg-background/60 sticky top-10 z-50 container px-6 mx-auto flex-wrap gap-6'
      >
        <h1 className='text-2xl font-bold leading-tight tracking-tighter md:text-3xl lg:leading-[1.1]'>
          User Profile
        </h1>
      </section>
      <section
        id='user-profile'
        className='scroll-mt-20 container px-6 py-6 mx-auto grid flex-1 gap-12 grid-cols-1 lg:grid-cols-2'
      >
        {/* Profile Image Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <Form {...profileImageForm}>
            <form
              onSubmit={profileImageForm.handleSubmit(handleSaveProfileImage)}
            >
              <CardContent className='flex flex-col gap-4'>
                <Avatar className='w-32 h-32 m-auto'>
                  <AvatarImage
                    src={session.user.image || ''}
                    alt={session.user.name || 'unknown'}
                  />
                  <AvatarFallback className='text-2xl font-bold'>
                    {session.user.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <FormField
                  control={profileImageForm.control}
                  name='url'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter a valid image URL'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a URL for your profile image (e.g., .jpg, .png,
                        .gif, .webp).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {imageMessage && (
                  <p className='text-green-500 text-sm'>{imageMessage}</p>
                )}
              </CardContent>
              <CardFooter>
                <Button type='submit' variant='outline'>
                  {session.user.image
                    ? 'Change Profile Picture'
                    : 'Set Profile Picture'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {/* Password Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              {hasPassword ? 'Change Password' : 'Set Password'}
            </CardTitle>
          </CardHeader>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(handleSetOrChangePassword)}
            >
              <CardContent className='flex flex-col gap-4'>
                {hasPassword && (
                  <FormField
                    control={passwordForm.control}
                    name='currentPassword'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input
                            type='password'
                            placeholder='Enter current password'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={passwordForm.control}
                  name='newPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='Enter new password'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='Confirm new password'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {passwordMessage && (
                  <p
                    className={`${
                      passwordMessage.toLowerCase().includes('incorrect') ||
                      passwordMessage.toLowerCase().includes('failed')
                        ? 'text-red-500'
                        : 'text-green-500'
                    } text-sm`}
                  >
                    {passwordMessage}
                  </p>
                )}
              </CardContent>

              <CardFooter>
                <Button type='submit' variant='outline' className='mt-4'>
                  {hasPassword ? 'Change Password' : 'Set Password'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {/* Connected Providers Section */}
        <Card className='col-span-full'>
          <CardHeader>
            <CardTitle>Connected Login Providers</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            {connectedProviders.length > 0 ? (
              connectedProviders.map((provider) => (
                <div key={provider.provider}>
                  <div className='flex gap-2 items-center'>
                    <Card className='text-sm rounded-md flex flex-row items-center gap-2 justify-center px-2 py-1 '>
                      {provider.provider.charAt(0).toUpperCase() +
                        provider.provider.slice(1)}{' '}
                      {provider.provider === 'google' && (
                        <GoogleIcon size={12} />
                      )}
                      {provider.provider === 'credentials' && (
                        <IconKeyFilled size={16} />
                      )}
                      | connected on{' '}
                      {new Date(provider.createdAt).toLocaleString()}
                    </Card>
                  </div>
                </div>
              ))
            ) : (
              <p>No connected providers found.</p>
            )}
          </CardContent>
        </Card>
      </section>
      <section className='container px-6 py-6 mx-auto'>
        <Button onClick={handleBackup}>Backup</Button>
      </section>
    </div>
  );
}
