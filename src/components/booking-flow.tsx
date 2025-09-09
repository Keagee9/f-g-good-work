'use client';

import type { Service } from '@/lib/types';
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
  PartyPopper,
  Wand2,
} from 'lucide-react';
import { availableTimes } from '@/lib/data';
import { StyleSuggestor } from './style-suggestor';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface BookingFlowProps {
  services: Service[];
}

export function BookingFlow({ services }: BookingFlowProps) {
  const [step, setStep] = useState<'service' | 'date' | 'confirmation'>(
    'service'
  );
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    undefined
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
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
    setSelectedService(null);
    setSelectedDate(undefined);
    setSelectedTime(null);
  };

  const renderServiceSelection = () => (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Choose a Service
          </h2>
          <p className="text-muted-foreground text-foreground/80">
            Select a service to see availability.
          </p>
        </div>
        <StyleSuggestor />
      </div>

      <div className="border-t border-b border-border">
        {services.map((service, index) => (
          <div key={service.id}>
            <div className="flex justify-between items-center py-6">
              <span className="text-lg font-semibold">{service.name}</span>
              <Button onClick={() => handleServiceSelect(service)}>
                Select
              </Button>
            </div>
            {index < services.length - 1 && <Separator />}
          </div>
        ))}
      </div>
    </div>
  );

  const renderDateTimeSelection = () => {
    if (!selectedService) return null;

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
                    src={selectedService.image}
                    alt={selectedService.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    data-ai-hint={`${selectedService.name.split(' ')[0]} ${selectedService.name.split(' ')[1]}`}
                  />
                </div>
                <div className="p-6">
                  <Badge variant="secondary" className="mb-2">Selected Service</Badge>
                  <CardTitle className="font-headline text-primary-foreground">{selectedService.name}</CardTitle>
                   <p className="text-sm text-muted-foreground mt-2 flex items-center">
                    <Clock className="w-4 h-4 mr-2" /> {selectedService.duration}
                    <span className="mx-2">|</span>
                    <DollarSign className="w-4 h-4 mr-2" />
                    {selectedService.price.toFixed(2)}
                  </p>
                </div>
              </CardHeader>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center text-primary-foreground">
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
                    <h3 className="text-lg font-semibold mb-4 text-center md:text-left text-primary-foreground">
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
    if (!selectedService || !selectedDate || !selectedTime) return null;
    return (
      <div className="container py-12 flex justify-center items-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center items-center">
            <PartyPopper className="w-16 h-16 text-foreground mb-4" />
            <CardTitle className="text-3xl font-headline text-primary-foreground">
              Booking Confirmed!
            </CardTitle>
            <CardDescription className="text-card-foreground/80">
              Your appointment is set. We look forward to seeing you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="border rounded-lg p-4 space-y-2">
               <h3 className="font-semibold text-lg text-primary-foreground">{selectedService.name}</h3>
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
                {selectedService.duration}
              </p>
               <p className="text-muted-foreground flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                {selectedService.price.toFixed(2)}
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
