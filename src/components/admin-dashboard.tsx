'use client';

import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, orderBy, query, updateDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, LogOut, FileImage, Settings } from 'lucide-react';
import Image from 'next/image';
import { useFirebase } from '@/firebase';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { sendConfirmationEmail } from '@/ai/flows/send-confirmation-email-flow';
import Link from 'next/link';

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
  const { auth, firestore: db } = useFirebase();

  useEffect(() => {
    if (!db) return;

    const bookingsCol = collection(db, 'bookings');
    const q = query(bookingsCol, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const bookingsList = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        })) as Booking[];
        setBookings(bookingsList);
        setIsLoading(false);
      },
      (serverError) => {
        // Non-admins might not have permission, but we should not crash the app
        if (serverError.code === 'permission-denied') {
            console.warn("Permission denied to fetch bookings. This is expected for non-admin users.");
             toast({
              title: 'Permission Denied',
              description: 'You do not have permission to view bookings.',
              variant: 'destructive',
            });
        } else {
            const permissionError = new FirestorePermissionError({
              path: bookingsCol.path,
              operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, toast]);

  const handleConfirmBooking = async (booking: Booking) => {
    if (!db) return;
    const bookingRef = doc(db, 'bookings', booking.id);
    const updatedData = { status: 'confirmed' };
    
    updateDoc(bookingRef, updatedData)
      .then(() => {
        toast({
          title: 'Booking Confirmed!',
          description: 'The booking status has been updated and a confirmation email has been sent.',
        });

        // Send confirmation email
        sendConfirmationEmail({
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          serviceName: booking.serviceName,
          date: booking.date,
        }).catch(emailError => {
            console.error("Failed to send confirmation email:", emailError);
             toast({
                variant: 'destructive',
                title: 'Email Failed to Send',
                description: 'The booking was confirmed, but the confirmation email could not be sent.',
            });
        });

      })
      .catch(serverError => {
        const permissionError = new FirestorePermissionError({
          path: bookingRef.path,
          operation: 'update',
          requestResourceData: updatedData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
       <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <h1 className="text-xl md:text-2xl font-bold font-headline text-primary">Admin Dashboard</h1>
           <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="container py-8 px-4 md:px-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>View and manage your appointment requests. New bookings will appear in real-time.</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={() => window.location.reload()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
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
                      <TableHead>Created At</TableHead>
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
                        <TableCell>
                            {booking.createdAt ? new Date(booking.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                        </TableCell>
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
                                <div className="mt-4 relative w-full" style={{paddingBottom: '100%'}}>
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
                            <Button size="sm" onClick={() => handleConfirmBooking(booking)}>
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
