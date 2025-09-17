
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { serviceCategories } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Phone, MapPin, Clock, Instagram, Facebook } from 'lucide-react';

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
            <h1 className="text-xl md:text-2xl font-bold font-headline text-foreground">
              F&G Luxury Hair
            </h1>
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
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10 px-4 md:px-6">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl font-headline text-primary">
                Transform Your Look with F&G Luxury Hair Care
              </h2>
              <p className="mt-6 max-w-2xl mx-auto md:mx-0 text-lg text-primary/80">
                Experience the finest in hair styling, coloring, and treatments
                at F&G Luxury Hair. Our expert stylists create stunning looks
                tailored just for you.
              </p>
              <div className="mt-10">
                <Button asChild size="lg">
                  <Link href="/booking">Book Now</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <Image
                src="https://v0-hair-salon-website-design-six.vercel.app/images/fg-luxury-hairs-logo.png"
                alt="F&G Luxury Hair Logo"
                width={400}
                height={400}
                className="rounded-lg w-full max-w-xs sm:max-w-sm h-auto"
                data-ai-hint="logo"
              />
            </div>
          </div>
        </section>

        <section id="services" className="container py-12 md:py-20 px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tight font-headline text-primary text-center mb-2">
            Our Services
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            A brief overview of what we offer. Click "Book Now" to see all options.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceCategories.map(category => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="relative w-full h-48 mb-4 rounded-md overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      style={{ objectFit: 'contain' }}
                      data-ai-hint={category.name}
                    />
                  </div>
                  <CardTitle className="text-primary font-headline">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {category.variants[0].description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

      </main>
      <footer className="bg-card text-card-foreground py-8">
        <div className="container grid grid-cols-1 md:grid-cols-3 gap-8 text-sm px-4 md:px-6">
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-primary">Contact Us</h3>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-primary" />
              <a href="tel:+13234718770" className="hover:text-primary">(323) 471-8770</a>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-primary" />
              <span>13130 Doty Ave apt 9 Hawthorn ca 90250</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-primary" />
              <span>Mon-Sat: 9AM - 7PM</span>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-primary">Follow Us</h3>
            <div className="flex items-center gap-4">
              <a href="https://www.instagram.com/fgluxuryhair12/?igsh=MW1xZjFoamlrNjkzMw%3D%3D&utm_source=ig_contact_invite#" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="https://www.facebook.com/goodnessoluchi.abengowe?mibextid=wwXIfr&mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="https://api.whatsapp.com/qr/YY3IRBADAQJGK1?autoload=1&app_absent=0" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                 <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path d="M16.75 13.96c.25.13.43.2.5.28.08.08.13.18.15.25.03.08.03.18 0 .28-.03.1-.08.18-.13.2-.05.03-.13.05-.2.05-.08 0-.15-.03-.23-.05-.08-.03-.18-.05-.25-.08-.1-.03-.2-.08-.33-.13-.13-.05-.25-.1-.38-.18-.13-.08-.25-.15-.38-.25-.13-.1-.25-.2-.4-.3-.15-.1-.28-.2-.43-.33-.15-.13-.28-.25-.4-.4-.13-.15-.25-.3-.35-.45-.1-.15-.18-.3-.25-.45-.05-.15-.1-.3-.13-.45-.03-.15-.05-.3-.05-.45s0-.28.03-.4.05-.2.08-.25c.03-.05.08-.1.13-.13.05-.03.1-.05.15-.05.05 0 .1.02.15.03l.18.05c.05.02.1.03.13.05.03.02.05.03.08.05s.05.05.08.08c.02.03.05.07.08.1.02.03.05.07.08.1.03.05.05.08.07.13.02.05.03.1.03.15s-.02.1-.03.13c-.02.03-.03.07-.05.1-.02.03-.05.05-.08.08-.03.03-.05.05-.08.07l-.1.05c-.02.02-.03.02-.05.02-.02 0-.03-.02-.05-.03-.02-.02-.05-.03-.08-.05-.15-.08-.3-.18-.45-.3-.15-.13-.28-.25-.4-.4-.13-.15-.25-.3-.35-.48-.1-.18-.18-.35-.23-.55-.05-.2-.08-.4-.08-.6s.03-.38.08-.53c.05-.15.13-.28.2-.4.08-.13.18-.23.28-.3.1-.08.2-.13.3-.15.1-.03.2-.03.28-.03.08 0 .15.02.23.05.08.03.15.07.23.1.08.05.15.08.2.13.08.08.13.15.18.2.05.05.08.1.1.15.03.05.05.1.07.15.02.05.03.1.03.13.02.03.02.05.02.08s-.02.07-.03.08c-.02.02-.03.03-.05.05-.02.02-.05.03-.08.05l-.13.05c-.03.02-.05.02-.07.02-.02 0-.05-.02-.07-.03l-.1-.08c-.03-.03-.05-.05-.08-.07-.03-.02-.05-.05-.08-.07-.03-.03-.07-.05-.1-.08-.15-.1-.3-.2-.48-.25-.18-.05-.35-.08-.53-.08-1.4 0-2.6.48-3.6 1.45-1 .98-1.5 2.15-1.5 3.55 0 .6.13 1.15.38 1.65.25.5.58.95.98 1.35.4.4.85.73 1.35.98.5.25 1.05.38 1.65.38.35 0 .68-.05 1-.13.33-.08.63-.2.9-.38.28-.18.5-.38.7-.6.2-.23.38-.48.5-.75l.2-.45c.03-.08.05-.15.08-.23.03-.08.07-.15.1-.23.05-.08.1-.15.15-.23.05-.08.1-.15.15-.2h.13c.05 0 .1 0 .1.02.03.02.05.03.08.05.02.02.05.05.08.07l.25.25c.08.08.15.15.2.2.08.05.13.1.18.13h.05c.05 0 .1 0 .13-.02.03-.02.05-.03.07-.05l.23-.2c.08-.08.15-.15.2-.23.05-.08.1-.18.13-.25.03-.08.05-.18.05-.28s-.02-.2-.05-.28-.08-.15-.13-.2z" />
                  </svg>
              </a>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end text-left md:text-right">
            <p className="text-sm text-muted-foreground">
              Built with Next.js and Generative AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

    