// src/app/components/moods/TableControls.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { debounce } from 'lodash';

/**
 * Props for TableControls component.
 */
export type TableControlsProps = {
  initialFilter: string;
  columnDefs: Readonly<
    Array<{ id: string; header: string; sortable?: boolean }>
  >;
  currentPage: number;
  currentPageSize: number;
  currentSort?: string;
  initialVisible?: string;
  buttons: React.ReactNode;
};

/**
 * Renders table-level controls: filter input, column visibility menu, create-dialog trigger.
 */
export default function TableControls({
  initialFilter,
  columnDefs,
  initialVisible,
  buttons,
}: TableControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filterValue, setFilterValue] = useState(initialFilter);

  const visibleParam = searchParams.get('show') ?? initialVisible;
  const allIds = columnDefs.map((c) => c.id);
  const visibleSet = new Set<string>(
    visibleParam ? visibleParam.split(',') : allIds
  );

  /**
   * Updates a specific search parameter and navigates without scroll.
   */
  const updateSearchParam = useCallback(
    (key: string, value: string | null) => {
      const qp = new URLSearchParams(Array.from(searchParams.entries()));
      if (value == null) qp.delete(key);
      else qp.set(key, value);

      // Reset page to 0 when filter changes
      // Check if the key being updated IS 'filter' and if page exists and is not '0'
      if (key === 'filter' && qp.has('page') && qp.get('page') !== '0') {
        qp.set('page', '0');
      }

      const queryString = qp.toString();
      router.push(`${pathname}${queryString ? `?${queryString}` : ''}`, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  // Memoize the creation of the debounced function
  const debouncedFilter = useMemo(() => {
    // Create the debounced function that calls updateSearchParam
    return debounce((value: string) => {
      updateSearchParam('filter', value || null); // Pass null if value is empty string
    }, 300); // 300ms debounce delay
  }, [updateSearchParam]); // Recreate the debounced function only if updateSearchParam changes

  // IMPORTANT: Add cleanup for the debounced function
  useEffect(() => {
    // Return a cleanup function that cancels the debounce on unmount
    // or when the debounced function instance changes (though it shouldn't change often now)
    return () => {
      debouncedFilter.cancel();
    };
  }, [debouncedFilter]);
  /**
   * Handles user typing in filter box.
   */
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setFilterValue(v);
    debouncedFilter(v.trim());
  };

  useEffect(() => {
    setFilterValue(searchParams.get('filter') || '');
  }, [searchParams]);

  /**
   * Toggles visibility of a column and updates URL.
   */
  const handleToggleColumn = (id: string, show: boolean) => {
    const next = new Set(visibleSet);
    if (show) next.add(id);
    else next.delete(id);

    const value =
      next.size === allIds.length ? null : Array.from(next).join(',');
    updateSearchParam('show', value);
  };

  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-2'>
      <Input
        placeholder='Filter names...'
        value={filterValue}
        onChange={handleFilterChange}
        className='max-w-sm'
      />

      <div className='flex gap-2'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>
              Columns <ChevronDown className='ml-1 h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {columnDefs
              .filter((col) => col.header)
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={visibleSet.has(col.id)}
                  onCheckedChange={(checked) =>
                    handleToggleColumn(col.id, !!checked)
                  }
                >
                  {col.header}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {buttons}
      </div>
    </div>
  );
}
