import { Card } from '@/components/ui/card';
import { getCalendarData } from './logic';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { z } from 'zod';
import Days from './days';
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};
const YearInPixels = async ({ searchParams }: Props) => {
  const { year: y, month: m } = await searchParams;
  const { year, months, currentMonth } = getCalendarData();

  const urlMonth = z.string().safeParse(m).success ? m : currentMonth.name;
  const urlYear = z.number().safeParse(y).success ? y : year;

  const selectedYear = urlYear as string;
  const selectedMonth =
    months.find(
      (month) => String(urlMonth).toLowerCase() === month.name.toLowerCase()
    ) ?? currentMonth;

  return (
    <Card className='p-2 flex flex-col gap-2'>
      {/* <MoodDialog>
        <Button>Edit Moods</Button>
      </MoodDialog> */}
      <Card className='p-2'>{selectedYear}</Card>
      <div className='flex flex-row gap-2'>
        {months.map((month) => (
          <Button asChild key={month.index} className='p-3 rounded-xl'>
            <Link
              href={`?${new URLSearchParams({
                year: selectedYear,
                month: month.name,
              })}`}
            >
              {month.name}
            </Link>
          </Button>
        ))}
      </div>
      <Days selectedMonth={selectedMonth} />
    </Card>
  );
};

export default YearInPixels;
