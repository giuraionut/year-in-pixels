'use client';

import {
  getProviders,
  signIn,
  ClientSafeProvider,
  useSession,
} from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Providers {
  [key: string]: ClientSafeProvider;
}

export default function SignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [providers, setProviders] = useState<Providers | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };

    fetchProviders();

    // Redirect if the user is already logged in
    if (session) {
      router.push('/dashboard'); // Change '/dashboard' to your desired page
    }
  }, [session, router]);

  // Prevent the page from rendering until session and providers are loaded
  if (status === 'loading' || !providers) return <div>Loading...</div>;

  // Only render the login UI if the user is not logged in
  if (session) return null;

  return (
    <Card className='p-5 flex flex-col gap-5'>
      <h3 className='scroll-m-20 text-2xl font-semibold tracking-tight'>
        Sign in to Year In Pixels
      </h3>
      {Object.values(providers).map((provider) => (
        <Button key={provider.name} onClick={() => signIn(provider.id)}>
          Sign in with {provider.name}
        </Button>
      ))}
    </Card>
  );
}
