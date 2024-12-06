'use client';
import { Mood } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import { getUserMoods } from '../actions/moodActions';
import { Card } from '@/components/ui/card';
import MoodsTable from './MoodsTable';

export default function MoodsComponent() {
  const [userMoods, setUserMoods] = useState<Mood[]>([]);

  useEffect(() => {
    const fetchMoods = async () => {
      const moods = await getUserMoods();
      if (moods) setUserMoods(moods);
    };
    fetchMoods();
  }, []);

  return (
    <div className='p-2'>
      <Card className='p-2'>
        <h4 className='scroll-m-20 text-xl font-semibold tracking-tight text-center'>
          Manage your moods
        </h4>
      </Card>
      <MoodsTable data={userMoods} setUserMoods={setUserMoods} />
    </div>
  );
}
