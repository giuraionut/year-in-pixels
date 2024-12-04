'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react';
import { Mood } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import MoodDialog from './AddMoodDialog';
import { deleteUserMood, deleteUserMoodsBulk } from '../actions/moodActions';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { MoodsTableProps } from './Moods.types';

export default function MoodsTable({ data, setUserMoods }: MoodsTableProps) {
  const handleDelete = async (
    mood: Mood,
    setUserMoods: React.Dispatch<React.SetStateAction<Mood[]>>
  ) => {
    const deletedMood = await deleteUserMood(mood);

    if (deletedMood) {
      setUserMoods((prevMoods) =>
        prevMoods.filter((item) => item.id !== deletedMood.id)
      );
    }
  };

  const handleDeleteAll = async (
    selectedMoods: Mood[],
    setUserMoods: React.Dispatch<React.SetStateAction<Mood[]>>
  ) => {
    const selectedMoodsIds = selectedMoods.map((mood) => mood.id);

    const deletedMoods = await deleteUserMoodsBulk(selectedMoodsIds);

    if (deletedMoods) {
      setUserMoods((prevMoods) =>
        prevMoods.filter((item) => !selectedMoodsIds.includes(item.id))
      );
    }
  };

  const columns: ColumnDef<Mood>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            className='m-0 p-0'
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Name
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className='capitalize'>{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'color',
      header: 'Color',
      cell: ({ row }) => (
        <div
          className='h-8 w-8 rounded-lg'
          style={{ backgroundColor: row.getValue('color') }}
        ></div>
      ),
    },
    {
      accessorKey: 'hex_code',
      header: 'Hex',
      cell: ({ row }) => (
        <div className='lowercase'>{row.getValue('color')}</div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => (
        <div className='capitalize'>
          {(row.getValue('createdAt') as Date).toDateString()}
        </div>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const mood = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(mood.color)}
              >
                Copy color
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(mood, setUserMoods)}
              >
                Delete mood
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  // const [loading, setLoading] = React.useState<boolean>();
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedMoods = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  return (
    <div className='w-full'>
      <div className='flex items-center gap-2 py-4'>
        <Input
          placeholder='Filter names...'
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className='max-w-sm'
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='ml-auto'>
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className='capitalize'
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        <MoodDialog setUserMoods={setUserMoods}>
          <Button>Create New</Button>
        </MoodDialog>
      </div>
      {data.length <= 0 ? (
        <div className='flex flex-col gap-2'>
          <Skeleton className='p-4 max-w-[500px]' />
          <Skeleton className='p-4 max-w-[500px]' />
          <Skeleton className='p-4 max-w-[500px]' />
          <Skeleton className='p-4 max-w-[500px]' />
          <Skeleton className='p-4 max-w-[500px]' />
        </div>
      ) : (
        <>
          <Card>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className='h-24 text-center'
                    >
                      {`You don't have any moods yet,`}
                      <Button variant='ghost' className='p-1'>
                        create a new one!
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
          <div className='flex items-center justify-end space-x-2 py-4'>
            <div className='flex-1 text-sm text-muted-foreground'>
              {table.getFilteredSelectedRowModel().rows.length} of{' '}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className='space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
          {selectedMoods.length > 0 && (
            <div className='flex justify-end py-4'>
              <Button
                variant='destructive'
                onClick={() => handleDeleteAll(selectedMoods, setUserMoods)}
              >
                Delete All Selected
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
