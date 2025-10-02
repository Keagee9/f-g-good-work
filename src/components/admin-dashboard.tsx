'use client';

import { useState, useEffect, useCallback } from 'react';
import { app } from '@/lib/firebase';
import { getFirestore, collection, getDocs, doc, updateDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, LogOut, FileImage } from 'lucide-react';
import Image from 'next/image';

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  date: string;
  totalPrice: number;
  addons: string[];
  receiptDataUri: string;
  status: 'pending' | 'confirmed';
  createdAt: Timestamp;
}

export function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const db = getFirestore(app);
      const bookingsCol = collection(db, 'bookings');
      const q = query(bookingsCol, orderBy('createdAt', 'desc'));
      const bookingsSnapshot = await getDocs(q);
      const bookingsList = bookingsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as Booking[];
      setBookings(bookingsList);
    } catch (error) {
      console.error("Error fetching bookings: ", error);
      toast({
        variant: "destructive",
        title: "Failed to load bookings",
        description: "There was an error fetching the bookings data. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      const db = getFirestore(app);
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'confirmed'
      });
      toast({
        title: 'Booking Confirmed!',
        description: 'The booking status has been updated to confirmed.',
      });
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error("Error confirming booking: ", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update the booking status.",
      });
    }
  };

  const handleLogout = () => {
    // This is a simple reload to force re-authentication.
    // In a real app with proper auth, this would call a logout function.
    window.location.reload();
  };


  return (
    <div className="min-h-screen bg-background text-foreground">
       <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <h1 className="text-xl md:text-2xl font-bold font-headline text-primary">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={fetchBookings} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" size="icon" onClick={handleLogout}>
               <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 px-4 md:px-6">
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
            <CardDescription>View and manage all appointment requests.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="font-medium">{booking.customerName}</div>
                          <div className="text-sm text-muted-foreground">{booking.customerEmail}</div>
                           <div className="text-sm text-muted-foreground">{booking.customerPhone}</div>
                        </TableCell>
                        <TableCell>{booking.serviceName}</TableCell>
                        <TableCell>{booking.date}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                           <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" disabled={!booking.receiptDataUri}>
                                <FileImage className="w-4 h-4 mr-2" />
                                View Receipt
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Payment Receipt for {booking.customerName}</DialogTitle>
                              </DialogHeader>
                               {booking.receiptDataUri ? (
                                <div className="mt-4 relative w-full h-auto" style={{ aspectRatio: '9 / 16' }}>
                                  <Image
                                    src={booking.receiptDataUri}
                                    alt={`Receipt for ${booking.customerName}`}
                                    fill
                                    style={{ objectFit: 'contain' }}
                                    unoptimized
                                  />
                                </div>
                              ) : (
                                <p className="text-muted-foreground text-center py-8">No receipt was uploaded.</p>
                              )}
                            </DialogContent>
                          </Dialog>
                          {booking.status === 'pending' && (
                            <Button size="sm" onClick={() => handleConfirmBooking(booking.id)}>
                              Confirm Booking
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                 {bookings.length === 0 && !isLoading && (
                    <div className="text-center py-16">
                        <p className="text-muted-foreground">No bookings found.</p>
                    </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
