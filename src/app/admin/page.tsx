
'use client';

import { useState, useEffect } from 'react';
import { getBookings, type Booking } from '@/ai/flows/get-bookings-flow';
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
import { Loader2, AlertCircle } from 'lucide-react';

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        setLoading(true);
        const fetchedBookings = await getBookings();
        setBookings(fetchedBookings);
      } catch (err) {
        setError('Failed to fetch bookings. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
       <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4 md:px-6">
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
            <h1 className="text-xl md:text-2xl font-bold font-headline text-foreground">F&G Luxury Hair - Admin Panel</h1>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8 md:py-12 px-4 md:px-6">
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
            <CardDescription>
              A complete list of all appointments.
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
                      <TableHead>Service</TableHead>
                      <TableHead>Appointment Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Booked On</TableHead>
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
                          <TableCell>{booking.serviceName}</TableCell>
                          <TableCell>
                            <div>{booking.date}</div>
                            <div className="text-sm text-muted-foreground">{booking.time}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">{booking.createdAt}</TableCell>
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
