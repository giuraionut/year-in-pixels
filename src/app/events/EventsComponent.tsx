'use client';
import { Mood } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import { LoadingDots } from '@/components/icons/loading-dots';
import EventsTable from './EventsTable';
import { getUserEvents } from '@/actions/eventActions';

export default function EventsComponent() {
  const [userEvents, setUserEvents] = useState<Mood[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchEvents = async () => {
      const events = await getUserEvents();
      if (events) {
        setUserEvents(events);
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className='relative'>
      <section className='flex flex-col items-start gap-2 border-b border-border/40 py-8 dark:border-border md:py-10 lg:py-12'>
        <div className='container px-6 flex mx-auto flex-wrap gap-6'>
          <h1 className='text-2xl font-bold leading-tight tracking-tighter md:text-3xl lg:leading-[1.1]'>
            Manage your events
            {loading && (
              <div className='container px-6 py-6 mx-auto flex flex-col justify-between gap-6 max-w-[800px]'>
                <LoadingDots />
              </div>
            )}
          </h1>
        </div>
      </section>
      <div className='container px-6 py-6 mx-auto gap-6 max-w-[600px]'>
        <EventsTable
          data={userEvents}
          setUserEvents={setUserEvents}
          loading={loading}
        />
      </div>
    </div>
  );
}
