'use client';

import React from 'react';
import { PixelWithRelations } from '@/types/pixel';
import { Diary } from '@prisma/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarIcon, TrendingUp, Star, BookOpen, Smile } from 'lucide-react';

type YearlyInsightsProps = {
  pixels: PixelWithRelations[];
  year: number;
  selectedDate: string | null;
  diary: Diary | null;
};

export default function YearlyInsights({
  pixels,
  year,
  selectedDate,
  diary,
}: YearlyInsightsProps) {
  const stats = React.useMemo(() => {
    const totalDays = pixels.length;
    const moodCounts: Record<
      string,
      { name: string; color: string; count: number }
    > = {};
    let mostFrequentMood = { name: 'None', color: 'gray', count: 0 };

    pixels.forEach((pixel) => {
      pixel.moods.forEach((mtp) => {
        const moodId = mtp.mood.id;
        if (!moodCounts[moodId]) {
          let color = 'gray';
          try {
            const parsed = JSON.parse(mtp.mood.color);
            color = typeof parsed === 'string' ? parsed : (parsed.value || 'gray');
          } catch (e) {
            color = mtp.mood.color;
          }
          moodCounts[moodId] = { name: mtp.mood.name, color, count: 0 };
        }
        moodCounts[moodId].count++;
        if (moodCounts[moodId].count > mostFrequentMood.count) {
          mostFrequentMood = moodCounts[moodId];
        }
      });
    });

    return {
      totalDays,
      moodBreakdown: Object.values(moodCounts).sort((a, b) => b.count - a.count),
      mostFrequentMood,
    };
  }, [pixels]);

  const selectedPixel = React.useMemo(() => {
    if (!selectedDate) return null;
    return pixels.find(
      (p) => format(new Date(p.pixelDate), 'yyyy-MM-dd') === selectedDate
    );
  }, [pixels, selectedDate]);

  const renderDiaryContent = (content: string | null) => {
    if (!content) return <p className='text-muted-foreground italic'>No diary entry for this day.</p>;
    try {
      const json = JSON.parse(content);
      // Simple rendering for now, could be improved with a proper Tiptap viewer
      return (
        <div className='prose prose-sm dark:prose-invert max-w-none'>
           {json.content?.map((block: any, idx: number) => {
             if (block.type === 'paragraph') {
               return <p key={idx}>{block.content?.map((c: any) => c.text).join('')}</p>;
             }
             if (block.type === 'heading') {
               const Tag = `h${block.attrs.level}` as any;
               return <Tag key={idx}>{block.content?.map((c: any) => c.text).join('')}</Tag>;
             }
             return null;
           })}
        </div>
      );
    } catch (e) {
      return <p>{content}</p>;
    }
  };

  return (
    <div className='flex flex-col gap-6'>
      {/* Stats Summary */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Days Logged</CardTitle>
            <CalendarIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalDays}</div>
            <p className='text-xs text-muted-foreground'>
              pixels filled in {year}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Most Frequent Mood</CardTitle>
            <Smile className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-2'>
              <div
                className='w-4 h-4 rounded-full'
                style={{ backgroundColor: stats.mostFrequentMood.color }}
              />
              <div className='text-2xl font-bold capitalize'>
                {stats.mostFrequentMood.name}
              </div>
            </div>
            <p className='text-xs text-muted-foreground'>
              Recorded {stats.mostFrequentMood.count} times
            </p>
          </CardContent>
        </Card>

        <Card className='sm:col-span-2 md:col-span-1'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Mood Breakdown</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
             <div className='flex flex-wrap gap-1'>
                {stats.moodBreakdown.slice(0, 5).map(m => (
                    <Badge key={m.name} variant="secondary" className='flex items-center gap-1'>
                        <div className='w-2 h-2 rounded-full' style={{ backgroundColor: m.color }} />
                        {m.name}: {m.count}
                    </Badge>
                ))}
                {stats.moodBreakdown.length > 5 && <span className='text-xs text-muted-foreground'>+{stats.moodBreakdown.length - 5} more</span>}
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Day Details */}
      {selectedDate ? (
        <Card className='border-primary/50 shadow-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Star className='h-5 w-5 text-yellow-500 fill-yellow-500' />
              Details for {format(parseISO(selectedDate), 'PPPP')}
            </CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div className='flex flex-col sm:flex-row gap-6'>
                <div className='flex-1 space-y-4'>
                    <div>
                        <h4 className='text-sm font-semibold mb-2 flex items-center gap-2'>
                           <Smile className='h-4 w-4' /> Moods
                        </h4>
                        <div className='flex flex-wrap gap-2'>
                            {selectedPixel?.moods.map(mtp => {
                                let color = 'gray';
                                try {
                                  const parsed = JSON.parse(mtp.mood.color);
                                  color = typeof parsed === 'string' ? parsed : (parsed.value || 'gray');
                                } catch (e) {
                                  color = mtp.mood.color;
                                }
                                return (
                                  <Badge key={mtp.mood.id} style={{ backgroundColor: color, color: 'white' }}>
                                      {mtp.mood.name}
                                  </Badge>
                                );
                            }) || <span className='text-muted-foreground text-sm italic'>No moods recorded.</span>}
                        </div>
                    </div>

                    <div>
                        <h4 className='text-sm font-semibold mb-2 flex items-center gap-2'>
                           <CalendarIcon className='h-4 w-4' /> Events
                        </h4>
                        <div className='flex flex-wrap gap-2'>
                            {selectedPixel?.events.map(pte => (
                                <Badge key={pte.event.id} variant="outline">
                                    {pte.event.name}
                                </Badge>
                            )) || <span className='text-muted-foreground text-sm italic'>No events recorded.</span>}
                        </div>
                    </div>
                </div>

                <div className='flex-1 border-l pl-0 sm:pl-6 border-border mt-4 sm:mt-0'>
                    <h4 className='text-sm font-semibold mb-2 flex items-center gap-2'>
                        <BookOpen className='h-4 w-4' /> Diary Entry
                    </h4>
                    <ScrollArea className='h-[150px] w-full rounded-md border p-4 bg-muted/30'>
                        {renderDiaryContent(diary?.content || null)}
                    </ScrollArea>
                </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className='text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground'>
          Click a pixel in the grid above to see daily details and insights.
        </div>
      )}
    </div>
  );
}
