import React from 'react';
import { Metadata } from 'next';
import { getSessionUserId } from '@/actions/actionUtils';
import { deleteUserMoodsBulk, getUserMoods } from '@/actions/moodActions';
import MoodsTableServer from './MoodsTableServer';
import { SelectedTableItemsProvider } from '../../components/SelectedTableItemsContext';
import BulkDeleteTableItemsButton from '../../components/BulkDeleteTableItemsButton';
export const metadata: Metadata = {
  title: 'Moods',
  description: 'Moods',
};

type MoodsProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    sort?: string;
    filter?: string;
    show?: string;
  }>;
};

export default async function Moods({ searchParams }: MoodsProps) {
  const searchP = await searchParams;
  const fetchUserId = await getSessionUserId();
  if (!fetchUserId.success) {
    return { success: false, error: 'User not authenticated.' };
  }
  const userId = fetchUserId.data;
  const fetchMoods = await getUserMoods(userId);
  if (!fetchMoods.success) return <div>Error fetching moods</div>;
  return (
    <div className='max-w-[800px] mx-auto p-4'>
      <SelectedTableItemsProvider>
        <MoodsTableServer moods={fetchMoods.data} searchParams={searchP} />
        <BulkDeleteTableItemsButton onDeleteBulkAction={deleteUserMoodsBulk} />
      </SelectedTableItemsProvider>
    </div>
  );
}
