import { BookingFlow } from '@/components/booking-flow';
import { serviceCategories } from '@/lib/data';

export default function BookingPage() {
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
         <BookingFlow serviceCategories={serviceCategories} />
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
