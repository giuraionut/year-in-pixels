import { Card } from '@/components/ui/card';
import { Pixel } from '@prisma/client';

const PixelsByYear = ({ pixels }: { pixels: Pixel[] }) => {
  return pixels.length > 0 ? (
    <div className='grid grid-cols-12 gap-2'>
      {pixels.map((pixel) => {
        const moodColor = pixel?.mood?.color.value || '';
        return (
          <Card
            key={pixel.id}
            className='w-10 h-10 rounded-md m-0'
            style={{
              backgroundColor: moodColor,
              padding: 0, // Ensure no padding within the Card
              margin: 0, // Remove card margin to avoid unintended gaps
            }}
          ></Card>
        );
      })}
    </div>
  ) : (
    <h4 className='scroll-m-20 text-xl font-semibold tracking-tight'>
      No pixels found for this year.
    </h4>
  );
};

export default PixelsByYear;
