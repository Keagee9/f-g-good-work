
'use server';
/**
 * @fileOverview A flow for retrieving all bookings from Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { app } from '@/lib/firebase-admin';

const db = getFirestore(app);

// Note: We're not using a Zod schema for the entire booking object here
// because Firestore timestamps are complex objects that don't map cleanly
// to a simple Zod type for client-side rendering. We will format it on the server.
export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  date: string;
  time: string;
  totalPrice: number;
  addons: string[];
  createdAt: string; // We'll convert the Timestamp to a string
  status: string;
  receiptDataUri?: string;
}

export interface GetBookingsResponse {
    bookings: Booking[];
    bookedSlots: string[];
}

const GetBookingsOutputSchema = z.object({
    bookings: z.array(z.any()),
    bookedSlots: z.array(z.string()),
});


export async function getBookings(): Promise<GetBookingsResponse> {
    return getBookingsFlow();
}

const getBookingsFlow = ai.defineFlow(
  {
    name: 'getBookingsFlow',
    inputSchema: z.void(),
    outputSchema: GetBookingsOutputSchema,
  },
  async () => {
    const bookingsSnapshot = await db.collection('bookings').orderBy('createdAt', 'desc').get();
    const bookings: Booking[] = [];
    const bookedSlots: string[] = [];
    
    bookingsSnapshot.forEach(doc => {
        const data = doc.data();
        const createdAt = data.createdAt as Timestamp;

        // Handle cases where createdAt might not exist on older documents
        const createdAtString = createdAt 
            ? createdAt.toDate().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })
            : 'N/A';

        const booking: Booking = {
            id: doc.id,
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            customerPhone: data.customerPhone,
            serviceName: data.serviceName,
            date: data.date,
            time: data.time,
            totalPrice: data.totalPrice,
            addons: data.addons || [],
            createdAt: createdAtString,
            status: data.status,
            receiptDataUri: data.receiptDataUri,
        };
        bookings.push(booking);
        
        // Add date and time to bookedSlots for calendar disabling logic
        if (data.date && data.time) {
            // We need to parse the friendly date string back to a standard format
            const dateObj = new Date(data.date);
            const isoDate = dateObj.toISOString().split('T')[0];
            bookedSlots.push(`${isoDate}_${data.time}`);
        }
    });

    return { bookings, bookedSlots };
  }
);
