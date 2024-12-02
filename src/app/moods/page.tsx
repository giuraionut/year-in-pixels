'use client';
import { Mood } from '@prisma/client';
import React, { useCallback, useEffect, useState } from 'react';
import { getUserMoods } from '../actions/moodActions';
import { MoodsTable } from './moodsTable';

const Moods = () => {
  const [userMoods, setUserMoods] = useState<Mood[]>([]);

  useEffect(() => {
    const fetchMoods = async () => {
      const moods = await getUserMoods();
      setUserMoods(moods);
    };
    fetchMoods();
  }, []);

  return (
    <div>
      <MoodsTable data={userMoods} updateData={setUserMoods} />
    </div>
  );
};

export default Moods;
