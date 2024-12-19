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
import { LoadingDots } from '@/components/loading-dots';

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
  }, [session, router]);

  if (status === 'loading' || !providers)
    return (
      <div className='  h-full flex items-center justify-center'>
        <LoadingDots />
      </div>
    );
  return (
    <div className='container px-6 py-6 mx-auto gap-6 max-w-[400px]'>
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
    </div>
  );
}
