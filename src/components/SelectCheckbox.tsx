'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useSelectedItems } from './SelectedTableItemsContext';

export function SelectCheckbox({ itemId }: { itemId: string }) {
  const { selected, toggle } = useSelectedItems();
  const isChecked = selected.has(itemId);

  return (
    <Checkbox
      aria-label='Select Event'
      checked={isChecked}
      onCheckedChange={() => toggle(itemId)}
    />
  );
}
