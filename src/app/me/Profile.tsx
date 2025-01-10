'use client';

import { getConnectedProviders, setPassword } from '@/actions/authActions';
import { updateUserImage } from '@/actions/userActions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getSession, signIn, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { z } from 'zod';

// Zod Schemas
const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long.')
      .max(100, 'Password cannot exceed 100 characters.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'], // Associate error with "confirmPassword" field
  });

const connectedProvidersResponseSchema = z.object({
  success: z.boolean(),
  providers: z
    .array(
      z.object({
        provider: z.string(),
        createdAt: z
          .union([z.string(), z.date()])
          .transform((val) => (val instanceof Date ? val.toISOString() : val)),
      })
    )
    .optional(),
  hasPassword: z.boolean().optional(),
  message: z.string().optional(),
});

// TypeScript Types

export default function Profile() {
  const { data: session, update } = useSession();
  const [password, setPasswordState] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState(''); // For changing password
  const [message, setMessage] = useState<string | null>(null);
  const [connectedProviders, setConnectedProviders] = useState<
    { provider: string; createdAt: string }[]
  >([]);
  const [hasPassword, setHasPassword] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  useEffect(() => {
    if (session?.user?.id) {
      (async () => {
        try {
          const response = await getConnectedProviders({
            userId: session.user.id,
          });
          console.log('connected providers response', response);
          const validatedResponse =
            connectedProvidersResponseSchema.parse(response);

          if (validatedResponse.success) {
            setConnectedProviders(validatedResponse.providers || []);
            setHasPassword(validatedResponse.hasPassword || false);
          } else {
            setMessage(
              validatedResponse.message || 'Failed to load connected providers.'
            );
          }
        } catch (error) {
          console.error('Error fetching connected providers:', error);
          setMessage('An error occurred while loading connected providers.');
        }
      })();
    }
  }, [session]);

  const handleSetPassword = async () => {
    try {
      // Validate passwords with Zod
      passwordSchema.parse({ password, confirmPassword });

      // Attempt to set the password
      const response = await setPassword({
        email: session?.user?.email || '',
        newPassword: password,
      });

      if (response.success) {
        setMessage('Password set successfully.');
        setHasPassword(true);
      } else {
        setMessage(response.message || 'Failed to set password.');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Extract and display the first validation error
        setMessage(error.errors[0]?.message || 'Validation error.');
      } else {
        console.error('Error setting password:', error);
        setMessage('An error occurred. Please try again.');
      }
    }
  };

  const handleChangePassword = async () => {
    try {
      // Validate passwords with Zod
      passwordSchema.parse({ password, confirmPassword });

      // Attempt to change the password
      const response = await setPassword({
        email: session?.user?.email || '',
        currentPassword,
        newPassword: password,
      });

      if (response.success) {
        setMessage('Password changed successfully.');
      } else {
        setMessage(response.message || 'Failed to change password.');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setMessage(error.errors[0]?.message || 'Validation error.');
      } else {
        console.error('Error changing password:', error);
        setMessage('An error occurred. Please try again.');
      }
    }
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  const handleSaveProfileImageUrl = async () => {
    try {
      const response = await updateUserImage(session.user.id, profileImageUrl);

      await update({ user: { image: profileImageUrl } });
      update((prev: any) => ({
        ...prev,
        user: { ...prev.user, image: profileImageUrl },
      }));
      console.log('session', session);
    } catch (error) {
      console.error('Error saving profile image:', error);
    }
  };
  return (
    <div className='container mx-auto px-6 py-6'>
      <h1 className='text-2xl font-bold mb-6'>User Profile</h1>

      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Name:</strong> {session.user.name}
          </p>
          <p>
            <strong>Email:</strong> {session.user.email}
          </p>
          {session.user.image && (
            <Avatar>
              <AvatarImage
                src={session.user.image!}
                alt={session.user.name ? session.user.name : 'unknown'}
              />
              <AvatarFallback>{session.user.name?.split('')[0]}</AvatarFallback>
            </Avatar>
          )}
          {JSON.stringify(session.user.image)}
          <Input
            type='text'
            placeholder='Enter profile image URL'
            value={profileImageUrl}
            onChange={(e) => setProfileImageUrl(e.target.value)}
            className='mt-4'
          />
          <Button
            onClick={handleSaveProfileImageUrl}
            className='mt-4'
            variant={'outline'}
          >
            {session.user.image
              ? 'Change Profile Picture'
              : 'Set Profile Picture'}
          </Button>
        </CardContent>
      </Card>

      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>
            {hasPassword ? 'Change Password' : 'Set Password'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasPassword ? (
            <>
              <p>Change your account password below.</p>
              <Input
                type='password'
                placeholder='Current Password'
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className='mt-4'
              />
              <Input
                type='password'
                placeholder='New Password'
                value={password}
                onChange={(e) => setPasswordState(e.target.value)}
                className='mt-2'
              />
              <Input
                type='password'
                placeholder='Confirm New Password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className='mt-2'
              />
              <Button
                onClick={handleChangePassword}
                className='mt-4'
                variant={'outline'}
              >
                Change Password
              </Button>
              {message && <p className='text-red-500 mt-2'>{message}</p>}
            </>
          ) : (
            <>
              <p>
                Set a password to enable logging in with email and password.
              </p>
              <Input
                type='password'
                placeholder='New Password'
                value={password}
                onChange={(e) => setPasswordState(e.target.value)}
                className='mt-4'
              />
              <Input
                type='password'
                placeholder='Confirm Password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className='mt-2'
              />
              <Button
                onClick={handleSetPassword}
                className='mt-4'
                variant={'outline'}
              >
                Set Password
              </Button>
              {message && <p className='text-red-500 mt-2'>{message}</p>}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected Providers</CardTitle>
        </CardHeader>
        <CardContent>
          {connectedProviders.length > 0 ? (
            connectedProviders.map((provider) => (
              <div
                key={provider.provider}
                className='mb-4 p-4 border rounded-md bg-primary/10'
              >
                <p>
                  <strong>Provider:</strong>{' '}
                  {provider.provider === 'credentials'
                    ? 'Email & Password'
                    : provider.provider.charAt(0).toUpperCase() +
                      provider.provider.slice(1)}
                </p>
                <p>
                  <strong>Connected At:</strong>{' '}
                  {new Date(provider.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p>No connected providers found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
