import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { authOptions } from '@/lib/auth';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Year in Pixels',
  description: 'Year in Pixels - Color your days with pixels',
};

const sections = [
  {
    id: 'pixels',
    title: 'See your Pixels',
    description: 'Quick glance over your Year in Pixels',
    bg: '',
    image: {
      src: '/images/Pixels@4x.webp',
      alt: 'Pixels Screenshot',
    },
    reverse: false,
  },
  {
    id: 'diary',
    title: 'Personal Diary',
    description:
      'Write about your day, reflect on your experiences, and keep track of your memories all in one place.',
    bg: '',
    image: {
      src: '/images/Diary@4x.webp',
      alt: 'Diary Screenshot',
    },
    reverse: true,
  },
  {
    id: 'dashboard',
    title: 'Interactive Dashboard',
    description:
      'Analyze your data with powerful visualizations. See trends, patterns, and insights about your moods and events.',
    bg: '',
    image: {
      src: '/images/Dashboard@4x.webp',
      alt: 'Dashboard Screenshot',
    },
    reverse: false,
  },
  {
    id: 'moods_events',
    title: 'Create custom Moods and Events',
    description: 'Create your custom moods and events, the way you want.',
    bg: '',

    image: {
      src: '/images/Moods@4x.webp',
      alt: 'Diary Screenshot',
    },
    reverse: true,
  },
];

const features = [
  {
    title: 'Mood Tracking',
    description:
      'Create custom moods and assign them to each day. See your emotional journey over time.',
    link: '#moods_events',
  },
  {
    title: 'Event Tracking',
    description:
      'Add events to your calendar and keep track of the moments that matter.',
    link: '#moods_events',
  },
  {
    title: 'Diary',
    description:
      'Document your daily thoughts and feelings in a personal diary.',
    link: '#diary',
  },
];

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <section className='relative'>
        <div className='flex flex-col-reverse md:flex-row items-center p-20'>
          <div className='m-auto space-y-6'>
            <h2 className='text-4xl md:text-5xl font-bold'>
              Visualize Your Year, One Pixel at a Time
            </h2>
            <p className='text-lg'>
              Track your moods, document your days, and uncover insights with
              Year in Pixels. Your journey, visualized.
            </p>
            <Button asChild variant='secondary'>
              <Link href='#features'>Explore Features</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id='features' className='py-20'>
        <div className='text-center container mx-auto p-4'>
          <h3 className='text-3xl font-bold'>Features</h3>
          <p className='mt-4'>Discover Year in Pixels one feature at a time.</p>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-12'>
            {features.map((feature, index) => (
              <Card key={index} className='p-4'>
                <Link href={feature.link}>
                  <CardContent className='cursor-pointer '>
                    <CardTitle className='text-xl font-semibold'>
                      {feature.title}
                    </CardTitle>
                    <CardDescription className='mt-2'>
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Sections */}
      {sections.map((sec) => (
        <section key={sec.id} id={sec.id} className={`py-20 ${sec.bg}`}>
          <div
            className={`px-20 flex flex-col md:flex-row items-center ${
              sec.reverse ? 'md:flex-row-reverse' : ''
            }`}
          >
            <div className='md:w-1/2 md:pr-12 space-y-6'>
              <h3 className='text-3xl font-bold'>{sec.title}</h3>
              <p>{sec.description}</p>
            </div>
            <div className='md:w-1/2'>
              <Image
                src={sec.image.src}
                alt={sec.image.alt}
                width={1800}
                height={1200}
              />
            </div>
          </div>
        </section>
      ))}

      {/* Call to Action Section */}
      <section className='py-20'>
        <div className='text-center '>
          <h3 className='text-3xl font-bold mb-4'>Start Your Journey Today</h3>
          <Button asChild variant='secondary'>
            <Link href='/api/auth/signin'>Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
