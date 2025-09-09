'use client';

import type { ServiceCategory, ServiceVariant } from '@/lib/types';
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
  Wand2,
} from 'lucide-react';
import { availableTimes } from '@/lib/data';
import { StyleSuggestor } from './style-suggestor';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import Link from 'next/link';

interface BookingFlowProps {
  serviceCategories: ServiceCategory[];
}

export function BookingFlow({ serviceCategories }: BookingFlowProps) {
  const [step, setStep] = useState<'service' | 'date' | 'confirmation'>(
    'service'
  );
  const [selectedVariant, setSelectedVariant] = useState<ServiceVariant | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    undefined
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleVariantSelect = (variant: ServiceVariant, category: ServiceCategory) => {
    setSelectedVariant(variant);
    setSelectedCategory(category);
    setStep('date');
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
    setStep('service');
    setSelectedVariant(null);
    setSelectedCategory(null);
    setSelectedDate(undefined);
    setSelectedTime(null);
  };

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
            <Button variant="outline" asChild>
                <Link href="/">
                    <Home className="w-4 h-4 mr-2" /> Home
                </Link>
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

  const renderDateTimeSelection = () => {
    if (!selectedVariant || !selectedCategory) return null;

    return (
      <div className="container py-8">
        <Button variant="ghost" onClick={resetFlow} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Services
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
                    <span className="mx-2">|</span>
                    <DollarSign className="w-4 h-4 mr-2" />
                    {selectedVariant.price.toFixed(2)}
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
             <div className="border rounded-lg p-4 space-y-2">
               <h3 className="font-semibold text-lg text-primary">{selectedVariant.name}</h3>
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
               <p className="text-muted-foreground flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                {selectedVariant.price.toFixed(2)}
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
    case 'service':
    default:
      return renderServiceSelection();
  }
}
