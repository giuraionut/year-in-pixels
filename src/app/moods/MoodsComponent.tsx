'use client';
import { Mood } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import { getUserMoods } from '@/actions/moodActions';
import { LoadingDots } from '@/components/icons/loading-dots';
import MoodsTable from './MoodsTable';

export default function MoodsComponent() {
  const [userMoods, setUserMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchMoods = async () => {
      const moods = await getUserMoods();
      if (moods) {
        setUserMoods(moods);
        setLoading(false);
      }
    };
    fetchMoods();
  }, []);

  return (
    <div className='relative flex flex-col items-start gap-2'>
      <section className='container px-6 flex mx-auto flex-wrap gap-6 border-b border-border/40 py-8 dark:border-border md:py-10 lg:py-12'>
        <h1 className='text-2xl font-bold leading-tight tracking-tighter md:text-3xl lg:leading-[1.1]'>
          Manage your moods
          {loading && (
            <div className='container px-6 py-6 mx-auto flex flex-col justify-between gap-6 max-w-[800px]'>
              <LoadingDots />
            </div>
          )}
        </h1>
      </section>
      <section className='container px-6 py-6 mx-auto gap-6 max-w-[600px]'>
        <MoodsTable
          data={userMoods}
          setUserMoods={setUserMoods}
          loading={loading}
        />
      </section>
    </div>
  );
}
