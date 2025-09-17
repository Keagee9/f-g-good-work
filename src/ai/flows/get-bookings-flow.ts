
'use server';
/**
 * @fileOverview A flow for retrieving all bookings from Firestore.
 */
import { config } from 'dotenv';
config();

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
}

const GetBookingsOutputSchema = z.array(z.any());

export async function getBookings(): Promise<Booking[]> {
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
    
    bookingsSnapshot.forEach(doc => {
        const data = doc.data();
        const createdAt = data.createdAt as Timestamp;

        bookings.push({
            id: doc.id,
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            customerPhone: data.customerPhone,
            serviceName: data.serviceName,
            date: data.date,
            time: data.time,
            totalPrice: data.totalPrice,
            addons: data.addons || [],
            // Convert timestamp to a more JSON-friendly format
            createdAt: createdAt.toDate().toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }),
            status: data.status,
        });
    });

    return bookings;
  }
);
