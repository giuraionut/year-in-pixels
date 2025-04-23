import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface PaginationControlsProps {
  pageIndex: number;
  pageCount: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  currentFilter?: string;
  currentPageSize: number;
  currentSort?: string;
  currentShow?: string;
  totalItems: number;
}

/**
 * Renders pagination buttons and page info, preserving relevant query parameters.
 */
export default function PaginationControls({
  pageIndex,
  pageCount,
  canPreviousPage,
  canNextPage,
  currentFilter,
  currentPageSize,
  currentSort,
  currentShow,
  totalItems,
}: PaginationControlsProps) {
  /**
   * Constructs a query string for navigation while preserving state.
   * @param page - target page index
   * @returns URL string starting with '?'
   */
  const createPageUrl = (page: number): string => {
    const params = new URLSearchParams();

    if (currentFilter) params.set('filter', currentFilter);
    if (currentShow) params.set('show', currentShow);
    params.set('page', String(page));
    params.set('pageSize', String(currentPageSize));
    if (currentSort) params.set('sort', currentSort);

    return `?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between py-2">
      <Button
        asChild
        variant="outline"
        disabled={!canPreviousPage}
        aria-label="Previous page"
      >
        {canPreviousPage ? (
          <Link href={createPageUrl(pageIndex - 1)}>← Previous</Link>
        ) : (
          <span className="opacity-50 cursor-not-allowed">← Previous</span>
        )}
      </Button>

      <span className="text-sm">
        Page <strong>{pageIndex + 1}</strong> of <strong>{pageCount}</strong> (
        {totalItems} items)
      </span>

      <Button
        asChild
        variant="outline"
        disabled={!canNextPage}
        aria-label="Next page"
      >
        {canNextPage ? (
          <Link href={createPageUrl(pageIndex + 1)}>Next →</Link>
        ) : (
          <span className="opacity-50 cursor-not-allowed">Next →</span>
        )}
      </Button>
    </div>
  );
}