// src/app/components/moods/MoodsTableServer.tsx
import React from 'react';
import { format } from 'date-fns';
import { Event } from '@prisma/client';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import PaginationControls from '../../components/PaginationControls';
import { SelectCheckbox } from '../../components/SelectCheckbox';
import TableControls from '../../components/TableControls';
import AddEventDialog from './AddEventDialog';
import EventRowActions from '@/components/EventRowActions';

interface EventsTableSearchParams {
  page?: string;
  pageSize?: string;
  sort?: string;
  filter?: string;
  show?: string;
}

interface EventsTableServerProps {
  events: Event[];
  searchParams: EventsTableSearchParams;
}

const columns = [
  { id: 'select', header: '', sortable: false },
  { id: 'name', header: 'Name', sortable: true },

  { id: 'createdAt', header: 'Created At', sortable: true },
  { id: 'actions', header: 'Actions', sortable: false },
] as const;

/**
 * Extracts a value from Mood based on column id, for sorting.
 */
const getSortValue = (
  event: Event,
  sortId: (typeof columns)[number]['id']
): string | number | Date => {
  switch (sortId) {
    case 'name':
      return event.name.toLowerCase();
    case 'createdAt':
      return event.createdAt;
    default:
      return '';
  }
};

/**
 * Constructs a query-string URL preserving filter, pageSize, sort, and show.
 * @param newSortId - column to sort by
 * @param newSortDir - 'asc' or 'desc'
 * @param params      - current search parameters
 * @returns           - URL starting with '?'
 */
function createSortUrl(
  newSortId: string,
  newSortDir: 'asc' | 'desc',
  params: EventsTableSearchParams
): string {
  const qp = new URLSearchParams();
  if (params.filter) qp.set('filter', params.filter);
  if (params.pageSize) qp.set('pageSize', params.pageSize);
  if (params.show) qp.set('show', params.show);
  qp.set('page', '0');
  qp.set('sort', `${newSortId}:${newSortDir}`);
  return `?${qp.toString()}`;
}

export default function MoodsTableServer({
  events,
  searchParams,
}: EventsTableServerProps) {
  const pageIndex = parseInt(searchParams.page ?? '0', 10);
  const pageSize = parseInt(searchParams.pageSize ?? '10', 10);
  const filterText = searchParams.filter?.toLowerCase() ?? '';
  const [sortId, sortDir] = (searchParams.sort ?? 'createdAt:desc').split(
    ':'
  ) as [(typeof columns)[number]['id'], 'asc' | 'desc'];

  const filtered = filterText
    ? events.filter((m) => m.name.toLowerCase().includes(filterText))
    : events;

  const sorted =
    sortId && columns.find((c) => c.id === sortId && c.sortable)
      ? [...filtered].sort((a, b) => {
          const aVal = getSortValue(a, sortId);
          const bVal = getSortValue(b, sortId);
          const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return sortDir === 'desc' ? -cmp : cmp;
        })
      : filtered;

  const total = sorted.length;
  const start = pageIndex * pageSize;
  const pageItems = sorted.slice(start, start + pageSize);

  const pageCount = Math.ceil(total / pageSize);
  const canPrev = pageIndex > 0;
  const canNext = (pageIndex + 1) * pageSize < total;

  const visibleIds = searchParams.show
    ? searchParams.show.split(',')
    : columns.map((c) => c.id);
  const visibleColumns = columns.filter((c) => visibleIds.includes(c.id));

  return (
    <div className='w-full space-y-4'>
      <TableControls
        initialFilter={searchParams.filter ?? ''}
        columnDefs={columns}
        currentPage={pageIndex}
        currentPageSize={pageSize}
        currentSort={searchParams.sort}
        initialVisible={searchParams.show}
        buttons={
          <AddEventDialog>
            <Button>Create New</Button>
          </AddEventDialog>
        }
      />

      <Card className='border shadow-sm rounded-lg'>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.map((col) => (
                  <TableHead
                    key={col.id}
                    className={cn(col.id === 'actions' && 'text-right')}
                  >
                    {col.sortable ? (
                      <Button
                        variant='ghost'
                        asChild
                        className='px-1 py-1 h-auto -ml-2'
                      >
                        <a
                          href={createSortUrl(
                            col.id,
                            sortId === col.id && sortDir === 'asc'
                              ? 'desc'
                              : 'asc',
                            searchParams
                          )}
                        >
                          {col.header}
                          <ArrowUpDown
                            className={cn(
                              'ml-2 h-3 w-3',
                              sortId === col.id
                                ? sortDir === 'desc' && 'rotate-180'
                                : 'opacity-30'
                            )}
                          />
                        </a>
                      </Button>
                    ) : (
                      col.header
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {pageItems.length > 0 ? (
                pageItems.map((event) => (
                  <TableRow key={event.id}>
                    {visibleColumns.map((col) => {
                      switch (col.id) {
                        case 'select':
                          return (
                            <TableCell key='select' className='w-4'>
                              <SelectCheckbox itemId={event.id} />
                            </TableCell>
                          );
                        case 'name':
                          return <TableCell key='name'>{event.name}</TableCell>;

                        case 'createdAt':
                          return (
                            <TableCell key='createdAt'>
                              {format(event.createdAt, 'PPP')}
                            </TableCell>
                          );
                        case 'actions':
                          return (
                            <TableCell key='actions' className='text-right'>
                              <EventRowActions event={event} />
                            </TableCell>
                          );
                        default:
                          return null;
                      }
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumns.length}
                    className='h-24 text-center'
                  >
                    No moods found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PaginationControls
        pageIndex={pageIndex}
        pageCount={pageCount}
        canPreviousPage={canPrev}
        canNextPage={canNext}
        currentFilter={searchParams.filter}
        currentPageSize={pageSize}
        currentSort={searchParams.sort}
        currentShow={searchParams.show}
        totalItems={total}
      />
    </div>
  );
}
