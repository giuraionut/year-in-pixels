import React from 'react';
import { Metadata } from 'next';
import { deleteUserEventsBulk, getUserEvents } from '@/actions/eventActions';
import { getSessionUserId } from '@/actions/actionUtils';
import MoodsTableServer from './EventsTableServer';
import { SelectedTableItemsProvider } from '../../components/SelectedTableItemsContext';
import BulkDeleteTableItemsButton from '../../components/BulkDeleteTableItemsButton';
export const metadata: Metadata = {
  title: 'Events',
  description: 'Events',
};

type EventsProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    sort?: string;
    filter?: string;
    show?: string;
  }>;
};
export default async function Events({ searchParams }: EventsProps) {
  const searchP = await searchParams;
  const fetchUserId = await getSessionUserId();
  if (!fetchUserId.success) {
    return <div className='p-6'>User not authenticated.</div>;
  }
  const userId = fetchUserId.data;
  const fetchEvents = await getUserEvents(userId);
  if (!fetchEvents.success) return <div>Error fetching events</div>;
  const events = fetchEvents.data;
  return (
    <div className='max-w-[800px] mx-auto p-4'>
      <SelectedTableItemsProvider>
        <MoodsTableServer events={events} searchParams={searchP} />
        <BulkDeleteTableItemsButton onDeleteBulkAction={deleteUserEventsBulk} />
      </SelectedTableItemsProvider>
    </div>
  );
}
