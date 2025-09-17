
'use client';

import { useState, useEffect } from 'react';
import { getBookings, type GetBookingsResponse } from '@/ai/flows/get-bookings-flow';
import type { Booking } from '@/ai/flows/get-bookings-flow';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, LogOut, Receipt } from 'lucide-react';
import { AuthGuard } from '@/components/auth-guard';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchBookings() {
      try {
        setLoading(true);
        const { bookings: fetchedBookings, bookedSlots: fetchedSlots } = await getBookings();
        setBookings(fetchedBookings);
        setBookedSlots(fetchedSlots);
      } catch (err) {
        setError('Failed to fetch bookings. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
       <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center">
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
            <h1 className="text-xl md:text-2xl font-bold font-headline text-foreground">F&G Luxury Hair - Admin Panel</h1>
          </div>
           <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>
      <main className="flex-1 container py-8 md:py-12 px-4 md:px-6">
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
            <CardDescription>
              A complete list of all appointments. Click on a receipt icon to view the proof of payment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="ml-4 text-muted-foreground">Loading bookings...</p>
              </div>
            )}
            {error && (
              <div className="flex flex-col items-center justify-center py-12 text-destructive">
                 <AlertCircle className="w-8 h-8 mb-2" />
                <p>{error}</p>
              </div>
            )}
            {!loading && !error && (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Appointment</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.length > 0 ? (
                      bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div className="font-medium text-primary">{booking.customerName}</div>
                            <div className="text-sm text-muted-foreground">{booking.customerEmail}</div>
                             <div className="text-sm text-muted-foreground">{booking.customerPhone}</div>
                          </TableCell>
                          <TableCell>
                             <div>{booking.date}</div>
                            <div className="text-sm text-muted-foreground">{booking.time}</div>
                            <div className="text-xs text-muted-foreground mt-1">Booked: {booking.createdAt}</div>
                          </TableCell>
                          <TableCell>
                             <div>{booking.serviceName}</div>
                             <div className="text-sm font-bold text-foreground">${booking.totalPrice.toFixed(2)}</div>
                              {booking.addons && booking.addons.length > 0 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Add-ons: {booking.addons.join(', ')}
                                </div>
                              )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                             {booking.receiptDataUri ? (
                               <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Receipt className="h-5 w-5 text-primary" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                    <DialogTitle>Payment Receipt for {booking.customerName}</DialogTitle>
                                    </DialogHeader>
                                    <div className="relative mt-4 w-full aspect-video rounded-md overflow-hidden border">
                                        <Image src={booking.receiptDataUri} alt={`Receipt for ${booking.customerName}`} fill style={{ objectFit: 'contain' }} />
                                    </div>
                                </DialogContent>
                               </Dialog>
                             ) : (
                                <span className="text-xs text-muted-foreground">No receipt</span>
                             )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          No bookings found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function AdminPage() {
    return (
        <AuthGuard>
            <AdminDashboard />
        </AuthGuard>
    )
}
