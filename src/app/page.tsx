import { BookingFlow } from '@/components/booking-flow';
import { Button } from '@/components/ui/button';
import { services } from '@/lib/data';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex items-center">
            <Sparkles className="h-6 w-6 mr-2 text-foreground" />
            <h1 className="text-2xl font-bold font-headline text-foreground">F&amp;G Luxury Hair</h1>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative w-full py-20 md:py-32 lg:py-40 bg-background">
           <Image
              src="https://picsum.photos/1200/800"
              alt="Luxury hair salon"
              fill
              className="object-cover opacity-10"
              data-ai-hint="salon interior"
            />
          <div className="container mx-auto text-center relative z-10">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl font-headline text-primary">
              Transform Your Look with F&amp;G Luxury Hair Care
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-primary/80">
              Experience the finest in hair styling, coloring, and treatments at F&G Luxury Hair. Our expert stylists create stunning looks tailored just for you.
            </p>
            <div className="mt-10">
              <Button asChild size="lg">
                <Link href="#booking">Book Now</Link>
              </Button>
            </div>
          </div>
        </section>
        
        <div id="booking">
          <BookingFlow services={services} />
        </div>
      </main>
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with Next.js and Generative AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
