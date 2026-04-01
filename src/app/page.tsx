import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { authOptions } from '@/lib/auth';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, Book, Calendar, Smile } from 'lucide-react';
import { 
  PixelsMockup, 
  DiaryMockup, 
  DashboardMockup, 
  MoodsEventsMockup 
} from '@/components/landing-mockups';

export const metadata: Metadata = {
  title: 'Year in Pixels',
  description: 'Year in Pixels - Color your days with pixels',
};

const sections = [
  {
    id: 'pixels',
    title: 'See your Pixels',
    description: 'Quick glance over your Year in Pixels. Visualize your entire year in a single grid, coloring each day based on your mood.',
    bg: '',
    Mockup: PixelsMockup,
    reverse: false,
  },
  {
    id: 'diary',
    title: 'Personal Diary',
    description:
      'Write about your day, reflect on your experiences, and keep track of your memories all in one place. Your personal space for thoughts.',
    bg: '',
    Mockup: DiaryMockup,
    reverse: true,
  },
  {
    id: 'dashboard',
    title: 'Interactive Dashboard',
    description:
      'Analyze your data with powerful visualizations. See trends, patterns, and insights about your moods and events over time.',
    bg: '',
    Mockup: DashboardMockup,
    reverse: false,
  },
  {
    id: 'moods_events',
    title: 'Create custom Moods and Events',
    description: 'Create your custom moods and events, the way you want. Personalize your tracking experience to fit your life.',
    bg: '',
    Mockup: MoodsEventsMockup,
    reverse: true,
  },
];

const features = [
  {
    title: 'Mood Tracking',
    description:
      'Create custom moods and assign them to each day. See your emotional journey over time.',
    link: '#moods_events',
    icon: Smile,
  },
  {
    title: 'Event Tracking',
    description:
      'Add events to your calendar and keep track of the moments that matter.',
    link: '#moods_events',
    icon: Calendar,
  },
  {
    title: 'Diary',
    description:
      'Document your daily thoughts and feelings in a personal diary.',
    link: '#diary',
    icon: Book,
  },
];

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 md:pt-20 lg:pt-32 pb-16 md:pb-20 lg:pb-32 bg-background">
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 animate-in fade-in slide-in-from-bottom-4 duration-1000 p-2">
                Visualize Your Year,<br /> One Pixel at a Time
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl leading-relaxed">
                Track your moods, document your days, and uncover insights with
                Year in Pixels. Your journey, beautifully visualized.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg hover:shadow-xl transition-all">
                <Link href="/api/auth/signin">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10 opacity-40 pointer-events-none overflow-hidden">
           <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl mix-blend-multiply animate-pulse" />
           <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl mix-blend-multiply animate-pulse delay-1000" />
           <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl mix-blend-multiply animate-pulse delay-2000" />
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Features</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to track your mental well-being and daily activities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card border-border/50 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                <Link href={feature.link} className="block h-full">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
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
      {sections.map((sec, index) => (
        <section key={sec.id} id={sec.id} className={`py-24 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
          <div className="container px-4 md:px-6 mx-auto">
            <div className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-24 ${sec.reverse ? 'lg:flex-row-reverse' : ''}`}>
              <div className="lg:w-1/2 space-y-6">
                <h3 className="text-3xl font-bold tracking-tight sm:text-4xl">{sec.title}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">{sec.description}</p>
                <Button asChild variant="outline">
                   <Link href="/api/auth/signin">Try it now</Link>
                </Button>
              </div>
              <div className="lg:w-1/2 w-full">
                <div className="relative aspect-video rounded-xl shadow-2xl bg-background flex items-center justify-center">
                  <sec.Mockup />
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="container px-4 md:px-6 mx-auto text-center space-y-8">
          <h3 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Start Your Journey Today
          </h3>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of others who are tracking their days and improving their well-being.
          </p>
          <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg">
            <Link href="/api/auth/signin">Get Started for Free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}