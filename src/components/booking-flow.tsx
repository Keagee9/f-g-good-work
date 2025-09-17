
'use client';

import type { ServiceCategory, ServiceVariant, Addon } from '@/lib/types';
import { useState, useEffect } from 'react';
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
  Copy,
  CreditCard,
  Home,
  PartyPopper,
  Loader2,
  Wand2,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { availableTimes } from '@/lib/data';
import { StyleSuggestor } from './style-suggestor';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { sendNotification } from '@/ai/flows/send-notification-flow';
import { getBookings, type Booking } from '@/ai/flows/get-bookings-flow';

interface BookingFlowProps {
  serviceCategories: ServiceCategory[];
  addons: Addon[];
}

export function BookingFlow({ serviceCategories, addons }: BookingFlowProps) {
  const [step, setStep] = useState<
    'policy' | 'service' | 'addons' | 'date' | 'payment' | 'upload' | 'confirmation'
  >('policy');
  const [selectedVariant, setSelectedVariant] = useState<ServiceVariant | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    undefined
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isNotifying, setIsNotifying] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (step === 'date') {
      const fetchBookings = async () => {
        setIsLoadingBookings(true);
        try {
          const existingBookings = await getBookings();
          setBookings(existingBookings);
        } catch (error) {
          console.error("Failed to fetch bookings", error);
          toast({
            variant: "destructive",
            title: "Could not load schedule",
            description: "Failed to fetch existing appointments. Please try refreshing.",
          });
        } finally {
          setIsLoadingBookings(false);
        }
      };
      fetchBookings();
    }
  }, [step, toast]);

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
    setStep('payment');
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
      description: `${text} has been copied.`,
    });
  };

  const resetFlow = () => {
    setStep('policy');
    setSelectedVariant(null);
    setSelectedCategory(null);
    setSelectedAddons([]);
    setSelectedDate(undefined);
    setSelectedTime(null);
    setReceiptFile(null);
    setReceiptPreview(null);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setIsNotifying(false);
    setBookings([]);
  };

  const getTotalPrice = () => {
    const variantPrice = selectedVariant?.price || 0;
    const addonsPrice = selectedAddons.reduce((total, addon) => total + addon.price, 0);
    return variantPrice + addonsPrice;
  }
  
  const handleReceiptFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleConfirmation = async () => {
    if (!selectedVariant || !selectedDate || !selectedTime || !receiptPreview) return;
    setIsNotifying(true);

    const date = selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    let notificationResult: { success: boolean; message: string } | null = null;
    
    try {
        notificationResult = await sendNotification({
            customerName,
            customerEmail,
            customerPhone,
            serviceName: selectedVariant.name,
            date,
            time: selectedTime,
            totalPrice: getTotalPrice(),
            addons: selectedAddons.map(a => a.name),
            receiptDataUri: receiptPreview,
        });

        if (notificationResult.success) {
            if (notificationResult.message.includes("email failed")) {
                 toast({
                    variant: 'destructive',
                    title: 'Booking Saved, Email Failed',
                    description: "Your booking is confirmed, but the email notification could not be sent. Please proceed with WhatsApp.",
                    duration: 9000,
                });
            } else if (notificationResult.message.includes("not configured")) {
                 toast({
                    title: 'Booking Saved, Email Skipped',
                    description: "Your booking is confirmed. Email notifications are not set up by the admin.",
                });
            }
            else {
                toast({
                    title: 'Success!',
                    description: 'Your booking has been saved and a confirmation email has been sent.',
                });
            }
        } else {
             toast({
                variant: 'destructive',
                title: 'Critical Booking Error',
                description: notificationResult.message || "Could not save the booking. Please try again.",
                duration: 9000,
            });
            setIsNotifying(false);
            return;
        }
    } catch (error) {
        console.error('Failed to call notification flow:', error);
        toast({
            variant: 'destructive',
            title: 'An Unexpected Error Occurred',
            description: 'Could not communicate with the booking server. Please try again.',
        });
        setIsNotifying(false);
        return;
    }

    const phoneNumber = '13234718770';
    const addonsText = selectedAddons.length > 0 
      ? `\nAdd-ons:\n${selectedAddons.map(a => `- ${a.name}`).join('\n')}` 
      : '\nAdd-ons: None';

    const message = `
*New Booking Notification!*

A client has booked an appointment and uploaded their payment receipt.

*Client Details:*
- *Name:* ${customerName}
- *Email:* ${customerEmail}
- *Phone:* ${customerPhone}

*Booking Details:*
- *Service:* ${selectedVariant.name}
- *Date:* ${date}
- *Time:* ${selectedTime}
- *Total Price:* $${getTotalPrice().toFixed(2)}${addonsText}

Please check your records for the uploaded receipt.
`.trim().replace(/\n/g, '%0A').replace(/\*/g, '%2A');

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    setStep('confirmation');
    setIsNotifying(false);
  };

  const isUploadFormValid = () => {
    return receiptFile && customerName && customerEmail && customerPhone;
  }
  
  const getBookedSlotsForDate = (date: Date) => {
    const dateString = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    return bookings
      .filter(b => b.date === dateString)
      .map(b => b.time);
  };


  const renderPolicy = () => (
    <div className="container py-8 md:py-12 px-4 md:px-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight font-headline text-primary text-center">
            Book Your Appointment
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground px-4">
            Please read our policies before booking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <h3 className="text-lg md:text-xl font-bold text-center text-primary">
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
              Hair is included (colors 1, 1B, 2, and 4). There's an extra $15 charge for other colors.
            </li>
            <li>
              ( please note. When making boho braids customers will provide their own curly hair. When adding more than 2 bundles of curly hair will be extra ($50)
            </li>
            <li>
              Please text the number provided three days prior to your appointment if you want a color that is not listed.
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
              className="rounded-md mx-auto border w-full max-w-md"
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
    <div className="container py-8 md:py-12 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline text-primary">
            Select Appointment
          </h2>
          <p className="text-muted-foreground">
            Choose a service to see available options.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => setStep('policy')} className="flex-grow sm:flex-grow-0">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <StyleSuggestor />
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {serviceCategories.map(category => (
          <AccordionItem value={category.id} key={category.id}>
            <AccordionTrigger className="text-lg md:text-xl font-headline text-primary hover:no-underline">
                <div className="flex items-center gap-4 text-left">
                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-md overflow-hidden flex-shrink-0">
                        <Image src={category.image} alt={category.name} fill style={{objectFit: 'contain'}} data-ai-hint={category.name} />
                    </div>
                    {category.name}
                </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="border-l-2 border-primary/20 pl-4 ml-6 md:ml-12">
                {category.variants.map((variant, index) => (
                  <div key={variant.id}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4">
                      <div className="flex-1 pr-4">
                        <h3 className="text-base md:text-lg font-semibold text-primary">{variant.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{variant.description}</p>
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="text-left sm:text-right flex-grow">
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
        <div className="container py-8 md:py-12 px-4 md:px-6">
            <Button variant="ghost" onClick={() => setStep('service')} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Services
            </Button>
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight font-headline text-primary text-center">
                        Add to Your Appointment
                    </CardTitle>
                    <CardDescription className="text-center text-muted-foreground px-4">
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
                            <div className="text-base md:text-lg font-bold text-foreground text-right">
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
                        Continue
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
  }

  const renderDateTimeSelection = () => {
    if (!selectedVariant || !selectedCategory) return null;

    const bookedSlots = selectedDate ? getBookedSlotsForDate(selectedDate) : [];

    return (
      <div className="container py-8 px-4 md:px-6">
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
                <CardTitle className="font-headline flex items-center text-primary text-xl md:text-2xl">
                  <CalendarDays className="w-5 h-5 mr-3 text-foreground" />
                  Select a Date &amp; Time
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-auto flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => {
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      return date < yesterday || date.getDay() === 0;
                    }}
                    className="rounded-md border"
                  />
                </div>
                {isLoadingBookings ? (
                    <div className="flex-1 w-full flex items-center justify-center">
                       <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : selectedDate && (
                  <div className="flex-1 w-full">
                    <h3 className="text-lg font-semibold mb-4 text-center md:text-left text-primary">
                      Available Times for{' '}
                      {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {availableTimes.map(time => {
                        const isBooked = bookedSlots.includes(time);
                        return (
                            <Button
                            key={time}
                            variant="outline"
                            onClick={() => handleTimeSelect(time)}
                            disabled={isBooked}
                            >
                            {time}
                            </Button>
                        );
                       })}
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

  const renderPaymentInstructions = () => {
    const zelleName = 'Goodness Abengowe';
    const zelleNumber = '(323) 471-8770';
    return (
      <div className="container py-12 flex justify-center items-center px-4 md:px-6">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Button
              variant="ghost"
              onClick={() => setStep('date')}
              className="self-start"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <CardTitle className="text-2xl md:text-3xl font-headline text-primary text-center pt-4">
              Payment Instructions - Zelle Only
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground px-4">
              Send Your Deposit via Zelle to confirm your appointment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-lg p-6 space-y-4 text-center bg-card">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Zelle Account Name
                </p>
                <p className="text-lg md:text-xl font-semibold text-primary">
                  {zelleName}
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Account Number
                </p>
                <div className="flex items-center justify-center gap-4">
                  <p className="text-xl md:text-2xl font-bold font-mono tracking-wider text-primary">
                    {zelleNumber}
                  </p>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyToClipboard(zelleNumber)}
                  >
                    <Copy className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center italic">
              A 25% deposit is required to secure your booking. This will be applied to your total service cost.
            </p>
             <p className="text-sm text-muted-foreground text-center">
              For users who are not on WhatsApp, you can share your proof of payment and booking info to this email: goodnessabengowe8@gmail.com
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              onClick={() => setStep('upload')}
              className="w-full"
              size="lg"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              I've Sent The Deposit, Proceed to Upload Receipt
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };
  
  const renderUploadReceipt = () => {
    return (
      <div className="container py-12 flex justify-center items-center px-4 md:px-6">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Button
              variant="ghost"
              onClick={() => setStep('payment')}
              className="self-start"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <CardTitle className="text-2xl md:text-3xl font-headline text-primary text-center pt-4">
              Final Step: Confirm Your Details
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground px-4">
              Please provide your contact information and upload your payment receipt.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Your full name" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="Your phone number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="Your email address" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} required />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="receipt-upload">Proof of Payment</Label>
              <Input id="receipt-upload" type="file" accept="image/*" onChange={handleReceiptFileChange} required />
               <p className="text-xs text-muted-foreground">Upload a screenshot or photo of your Zelle payment confirmation.</p>
            </div>

            {receiptPreview && (
              <div className="mt-4">
                <p className="text-sm font-medium text-primary mb-2">Receipt Preview:</p>
                <div className="relative w-full aspect-video rounded-md overflow-hidden border">
                  <Image
                    src={receiptPreview}
                    alt="Receipt preview"
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleConfirmation} disabled={!isUploadFormValid() || isNotifying} className="w-full" size="lg">
                {isNotifying ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Confirming...
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2"><path d="M16.75 13.96c.25.13.43.2.5.28.08.08.13.18.15.25.03.08.03.18 0 .28-.03.1-.08.18-.13.2-.05.03-.13.05-.2.05-.08 0-.15-.03-.23-.05-.08-.03-.18-.05-.25-.08-.1-.03-.2-.08-.33-.13-.13-.05-.25-.1-.38-.18-.13-.08-.25-.15-.38-.25-.13-.1-.25-.2-.4-.3-.15-.1-.28-.2-.43-.33-.15-.13-.28-.25-.4-.4-.13-.15-.25-.3-.35-.45-.1-.15-.18-.3-.25-.45-.05-.15-.1-.3-.13-.45-.03-.15-.05-.3-.05-.45s0-.28.03-.4.05-.2.08-.25c.03-.05.08-.1.13-.13.05-.03.1-.05.15-.05.05 0 .1.02.15.03l.18.05c.05.02.1.03.13.05.03.02.05.03.08.05s.05.05.08.08c.02.03.05.07.08.1.02.03.05.07.08.1.03.05.05.08.07.13.02.05.03.1.03.15s-.02.1-.03.13c-.02.03-.03.07-.05.1-.02.03-.05.05-.08.08-.03.03-.05.05-.08.07l-.1.05c-.02.02-.03.02-.05.02-.02 0-.03-.02-.05-.03-.02-.02-.05-.03-.08-.05-.15-.08-.3-.18-.45-.3-.15-.13-.28-.25-.4-.4-.13-.15-.25-.3-.35-.48-.1-.18-.18-.35-.23-.55-.05-.2-.08-.4-.08-.6s.03-.38.08-.53c.05-.15.13-.28.2-.4.08-.13.18-.23.28-.3.1-.08.2-.13.3-.15.1-.03.2-.03.28-.03.08 0 .15.02.23.05.08.03.15.07.23.1.08.05.15.08.2.13.08.08.13.15.18.2.05.05.08.1.1.15.03.05.05.1.07.15.02.05.03.1.03.13.02.03.02.05.02.08s-.02.07-.03.08c-.02.02-.03.03-.05.05-.02.02-.05.03-.08.05l-.13.05c-.03.02-.05.02-.07.02-.02 0-.05-.02-.07-.03l-.1-.08c-.03-.03-.05-.05-.08-.07-.03-.02-.05-.05-.08-.07-.03-.03-.07-.05-.1-.08-.15-.1-.3-.2-.48-.25-.18-.05-.35-.08-.53-.08-1.4 0-2.6.48-3.6 1.45-1 .98-1.5 2.15-1.5 3.55 0 .6.13 1.15.38 1.65.25.5.58.95.98 1.35.4.4.85.73 1.35.98.5.25 1.05.38 1.65.38.35 0 .68-.05 1-.13.33-.08.63-.2.9-.38.28-.18.5-.38.7-.6.2-.23.38-.48.5-.75l.2-.45c.03-.08.05-.15.08-.23.03-.08.07-.15.1-.23.05-.08.1-.15.15-.23.05-.08.1-.15.15-.2h.13c.05 0 .1 0 .1.02.03.02.05.03.08.05.02.02.05.05.08.07l.25.25c.08.08.15.15.2.2.08.05.13.1.18.13h.05c.05 0 .1 0 .13-.02.03-.02.05-.03.07-.05l.23-.2c.08-.08.15-.15.2-.23.05-.08.1-.18.13-.25.03-.08.05-.18.05-.28s-.02-.2-.05-.28-.08-.15-.13-.2z" /></svg>
                        Send Notification & Confirm Booking
                    </>
                )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };


  const renderConfirmation = () => {
    if (!selectedVariant || !selectedDate || !selectedTime) return null;
    return (
      <div className="container py-12 flex justify-center items-center px-4 md:px-6">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center items-center">
            <PartyPopper className="w-16 h-16 text-foreground mb-4" />
            <CardTitle className="text-2xl md:text-3xl font-headline text-primary">
              Booking Confirmed!
            </CardTitle>
            <CardDescription className="text-muted-foreground px-4">
              Your appointment is set. We look forward to seeing you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="border rounded-lg p-4 space-y-3">
               <h3 className="font-semibold text-lg text-primary">{selectedVariant.name}</h3>
                {selectedAddons.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-primary/80 text-sm">Add-ons:</h4>
                        <ul className="list-disc list-inside text-muted-foreground text-sm pl-4">
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
    case 'upload':
      return renderUploadReceipt();
    case 'payment':
      return renderPaymentInstructions();
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

    