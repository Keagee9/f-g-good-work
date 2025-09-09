
'use client';

import type { ServiceCategory, ServiceVariant, Addon } from '@/lib/types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import Image from 'next/image';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  DollarSign,
  Home,
  PartyPopper,
  Plus,
  Wand2,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { availableTimes } from '@/lib/data';
import { StyleSuggestor } from './style-suggestor';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import Link from 'next/link';

interface BookingFlowProps {
  serviceCategories: ServiceCategory[];
  addons: Addon[];
}

export function BookingFlow({ serviceCategories, addons }: BookingFlowProps) {
  const [step, setStep] = useState<
    'policy' | 'service' | 'addons' | 'date' | 'confirmation'
  >('policy');
  const [selectedVariant, setSelectedVariant] = useState<ServiceVariant | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    undefined
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleVariantSelect = (variant: ServiceVariant, category: ServiceCategory) => {
    setSelectedVariant(variant);
    setSelectedCategory(category);
    setStep('addons');
  };

  const handleAddonToggle = (addon: Addon) => {
    setSelectedAddons(prev => {
      if (prev.find(a => a.id === addon.id)) {
        return prev.filter(a => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep('confirmation');
  };

  const resetFlow = () => {
    setStep('policy');
    setSelectedVariant(null);
    setSelectedCategory(null);
    setSelectedAddons([]);
    setSelectedDate(undefined);
    setSelectedTime(null);
  };

  const getTotalPrice = () => {
    const variantPrice = selectedVariant?.price || 0;
    const addonsPrice = selectedAddons.reduce((total, addon) => total + addon.price, 0);
    return variantPrice + addonsPrice;
  }

  const renderPolicy = () => (
    <div className="container py-12 md:py-20">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight font-headline text-primary text-center">
            Book Your Appointment
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Please read our policies before booking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <h3 className="text-xl font-bold text-center text-primary">
            PLEASE READ BEFORE BOOKING ❗️❗️❗️
          </h3>
          <ul className="space-y-3 list-disc list-inside bg-card p-4 rounded-md border text-muted-foreground">
            <li>
              A 25% non-refundable deposit is required and is applied to the
              total cost of the service. Your remaining balance will be due in cash.
            </li>
            <li>Guests are not allowed. Only children being serviced are allowed 1 guardian to supervise them.</li>
            <li>Please come with your hair washed and blow-dried.</li>
            <li>
              If the style you want isn't an option on the booking site, please text +1 (323) 471-8770 for more assistance. Please allow 24 to 48 hours for a response.
            </li>
            <li>
              A $20 late fee will be applied after 15 minutes. After 30 minutes, your appointment will be cancelled, and your deposit will not be returned.
            </li>
            <li>Cash is the only form of payment allowed on the day of service.</li>
            <li>
              Hair is included (colors 1, 1B, 2, and 4). There's an extra $15 charge for other colors. Please text the number provided three days prior to your appointment if you want a color that is not listed.
            </li>
            <li>
              If you are picky, have a bad attitude, or bring bad stress to our business because you are not clear with what you want, we will not service you. Your deposit will be forfeited.
            </li>
            <li>All no-calls/no-shows will be charged, and your deposit will be forfeited.</li>
            <li>
              Hair must be washed, detangled, and properly blown out.
            </li>
          </ul>
          <div className="text-center space-y-2">
            <p className="font-semibold text-primary">Here's an example of how your hair should be:</p>
            <Image
              src="https://v0-hair-salon-website-design-six.vercel.app/images/hair-prep-example.png"
              alt="Hair preparation example"
              width={600}
              height={300}
              className="rounded-md mx-auto border"
              data-ai-hint="hair preparation"
            />
            <p className="text-xs text-muted-foreground">Hair preparation example showing properly prepared hair with a checkmark vs. improperly prepared hair with an X.</p>
          </div>
          <p className="text-center text-xs text-muted-foreground italic pt-4">
             By proceeding to book, you acknowledge that you have read and agree to all policies above.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={() => setStep('service')} size="lg" className="w-full md:w-auto">
            I Have Read and Agree to the Policies
          </Button>
           <Button variant="outline" asChild>
                <Link href="/">
                    <Home className="w-4 h-4 mr-2" /> Go Back Home
                </Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );


  const renderServiceSelection = () => (
    <div className="container py-12 md:py-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline text-primary">
            Select Appointment
          </h2>
          <p className="text-muted-foreground">
            Choose a service to see available options.
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep('policy')}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Policy
            </Button>
            <StyleSuggestor />
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {serviceCategories.map(category => (
          <AccordionItem value={category.id} key={category.id}>
            <AccordionTrigger className="text-xl font-headline text-primary hover:no-underline">
                <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 rounded-md overflow-hidden">
                        <Image src={category.image} alt={category.name} fill style={{objectFit: 'contain'}} data-ai-hint={category.name} />
                    </div>
                    {category.name}
                </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="border-l-2 border-primary/20 pl-4 ml-12">
                {category.variants.map((variant, index) => (
                  <div key={variant.id}>
                    <div className="flex justify-between items-center p-4 sm:p-6">
                      <div className="flex-1 pr-4">
                        <h3 className="text-lg font-semibold text-primary">{variant.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{variant.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">${variant.price.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">{variant.duration}</p>
                        </div>
                        <Button onClick={() => handleVariantSelect(variant, category)} variant="outline">
                          Select
                        </Button>
                      </div>
                    </div>
                    {index < category.variants.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
  
  const renderAddonSelection = () => {
    if (!selectedVariant) return null;
    return (
        <div className="container py-12 md:py-20">
            <Button variant="ghost" onClick={() => setStep('service')} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Services
            </Button>
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold tracking-tight font-headline text-primary text-center">
                        Add to Your Appointment
                    </CardTitle>
                    <CardDescription className="text-center text-muted-foreground">
                        Select any add-ons you'd like to include.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {addons.map(addon => (
                        <div key={addon.id} className="flex items-center justify-between p-4 rounded-lg border">
                           <div className="flex items-center gap-4">
                                <Checkbox 
                                  id={addon.id} 
                                  onCheckedChange={() => handleAddonToggle(addon)}
                                  checked={!!selectedAddons.find(a => a.id === addon.id)}
                                />
                                <label htmlFor={addon.id} className="flex flex-col">
                                    <span className="font-semibold text-primary">{addon.name}</span>
                                    <span className="text-sm text-muted-foreground">{addon.duration}</span>
                                </label>
                            </div>
                            <div className="text-lg font-bold text-foreground">
                                +${addon.price.toFixed(2)}
                            </div>
                        </div>
                    ))}
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-xl font-bold text-primary">
                        Total: ${getTotalPrice().toFixed(2)}
                    </div>
                    <Button onClick={() => setStep('date')} size="lg">
                        Continue to Date Selection
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
  }

  const renderDateTimeSelection = () => {
    if (!selectedVariant || !selectedCategory) return null;

    return (
      <div className="container py-8">
        <Button variant="ghost" onClick={() => setStep('addons')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Add-ons
        </Button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="p-0">
                <div className="relative w-full h-48">
                   <Image
                    src={selectedCategory.image}
                    alt={selectedCategory.name}
                    fill
                    style={{ objectFit: 'contain' }}
                    data-ai-hint={`${selectedCategory.name}`}
                  />
                </div>
                <div className="p-6">
                  <Badge variant="secondary" className="mb-2">Selected Service</Badge>
                  <CardTitle className="font-headline text-primary">{selectedVariant.name}</CardTitle>
                   <p className="text-sm text-muted-foreground mt-2 flex items-center">
                    <Clock className="w-4 h-4 mr-2" /> {selectedVariant.duration}
                  </p>
                  <Separator className="my-4" />
                  <h4 className="font-semibold text-primary mb-2">Add-ons</h4>
                  {selectedAddons.length > 0 ? (
                    <ul className="space-y-2">
                        {selectedAddons.map(addon => (
                            <li key={addon.id} className="flex justify-between text-sm text-muted-foreground">
                                <span>{addon.name}</span>
                                <span>+${addon.price.toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No add-ons selected.</p>
                  )}
                  <Separator className="my-4" />
                   <p className="text-lg font-bold text-foreground flex items-center justify-between">
                    <span>Total</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </p>
                </div>
              </CardHeader>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center text-primary">
                  <CalendarDays className="w-5 h-5 mr-3 text-foreground" />
                  Select a Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row gap-8">
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1)) }
                    className="rounded-md border"
                  />
                </div>
                {selectedDate && (
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-4 text-center md:text-left text-primary">
                      Available Times for{' '}
                      {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {availableTimes.map(time => (
                        <Button
                          key={time}
                          variant="outline"
                          onClick={() => handleTimeSelect(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderConfirmation = () => {
    if (!selectedVariant || !selectedDate || !selectedTime) return null;
    return (
      <div className="container py-12 flex justify-center items-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center items-center">
            <PartyPopper className="w-16 h-16 text-foreground mb-4" />
            <CardTitle className="text-3xl font-headline text-primary">
              Booking Confirmed!
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Your appointment is set. We look forward to seeing you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="border rounded-lg p-4 space-y-3">
               <h3 className="font-semibold text-lg text-primary">{selectedVariant.name}</h3>
                {selectedAddons.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-primary/80 text-sm">Add-ons:</h4>
                        <ul className="list-disc list-inside text-muted-foreground text-sm">
                            {selectedAddons.map(addon => (
                                <li key={addon.id}>{addon.name}</li>
                            ))}
                        </ul>
                    </div>
                )}
               <p className="text-muted-foreground flex items-center">
                <CalendarDays className="w-4 h-4 mr-2" />
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                at {selectedTime}
              </p>
               <p className="text-muted-foreground flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {selectedVariant.duration}
              </p>
              <Separator />
               <p className="font-bold text-lg text-foreground flex items-center justify-between">
                <span>Total Amount:</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </p>
             </div>
          </CardContent>
          <CardFooter>
            <Button onClick={resetFlow} className="w-full">
              Book Another Appointment
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };

  switch (step) {
    case 'confirmation':
      return renderConfirmation();
    case 'date':
      return renderDateTimeSelection();
    case 'addons':
      return renderAddonSelection();
    case 'service':
      return renderServiceSelection();
    case 'policy':
    default:
      return renderPolicy();
  }
}
