import { BookingFlow } from '@/components/booking-flow';
import { Button } from '@/components/ui/button';
import { services } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 text-primary"
            >
              <path d="M14 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" />
              <path d="M21.32 10.2a2.43 2.43 0 0 0-2.64-2.64L14 6l-2.05-4.1a1.6 1.6 0 0 0-2.9 0L7 6l-4.68 1.56a2.43 2.43 0 0 0-2.64 2.64L4 14l-4.1 2.05a1.6 1.6 0 0 0 0 2.9L4 21l1.56 4.68a2.43 2.43 0 0 0 2.64 2.64L12 24l2.05 4.1a1.6 1.6 0 0 0 2.9 0L17 24l4.68-1.56a2.43 2.43 0 0 0 2.64-2.64L20 14l4.1-2.05a1.6 1.6 0 0 0 0-2.9L20 7Z" />
            </svg>
            <h1 className="text-2xl font-bold font-headline text-foreground">F&G Luxury Hair</h1>
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
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl font-headline text-primary">
                Transform Your Look with F&G Luxury Hair Care
              </h2>
              <p className="mt-6 max-w-2xl text-lg text-primary/80">
                Experience the finest in hair styling, coloring, and treatments at F&G Luxury Hair. Our expert stylists create stunning looks tailored just for you.
              </p>
              <div className="mt-10">
                <Button asChild size="lg">
                  <Link href="#booking">Book Now</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
                <Image
                    src="https://v0-hair-salon-website-design-six.vercel.app/images/fg-luxury-hairs-logo.png"
                    alt="F&G Luxury Hair Logo"
                    width={400}
                    height={400}
                    className="rounded-lg"
                    data-ai-hint="logo"
                />
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
