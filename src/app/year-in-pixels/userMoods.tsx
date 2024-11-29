'use client';
import { Card } from '@/components/ui/card';
import { Mood } from '@prisma/client';
import React, { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserMoods } from '../actions/moodActions';

const UserMoods = () => {
  const [userMoods, setUserMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserMoods = async () => {
      setLoading(true);
      const moods = await getUserMoods();
      setUserMoods(moods);
      setLoading(false);
    };

    fetchUserMoods();
  }, []);

  // Memoize userMoods to avoid unnecessary re-renders
  const memoizedUserMoods = useMemo(() => userMoods, [userMoods]);

  return (
    <div className='flex flex-row gap-3'>
      {loading
        ? Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className='p-4 max-w-24 rounded-sm' />
          ))
        : memoizedUserMoods.map((mood: Mood) => (
            <Card
              className='p-2 max-w-24 rounded-sm text-center'
              key={mood.id}
              style={{ backgroundColor: mood.color }}
            >
              {mood.name}
            </Card>
          ))}
    </div>
  );
};

export default UserMoods;
