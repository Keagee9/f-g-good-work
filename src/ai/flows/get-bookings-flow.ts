
'use server';
/**
 * @fileOverview A flow for fetching all bookings from Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const BookingSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  serviceName: z.string(),
  date: z.string(),
  time: z.string(),
});
export type Booking = z.infer<typeof BookingSchema>;

const GetBookingsOutputSchema = z.array(BookingSchema);

export async function getBookings(): Promise<Booking[]> {
  return getBookingsFlow();
}

const getBookingsFlow = ai.defineFlow(
  {
    name: 'getBookingsFlow',
    outputSchema: GetBookingsOutputSchema,
  },
  async () => {
    try {
      const bookingsSnapshot = await db.collection('bookings').orderBy('createdAt', 'desc').get();
      const bookings: Booking[] = [];

      if (bookingsSnapshot.empty) {
        return [];
      }

      bookingsSnapshot.forEach(doc => {
        const data = doc.data();
        // Basic validation to ensure core fields exist
        if (data.customerName && data.serviceName && data.date && data.time) {
          bookings.push({
            id: doc.id,
            customerName: data.customerName,
            serviceName: data.serviceName,
            date: data.date,
            time: data.time,
          });
        }
      });

      return bookings;
    } catch (error) {
      console.error("Failed to fetch bookings from Firestore:", error);
      // Return an empty array on failure to prevent crashing the client.
      // The client should handle the case where no bookings are returned.
      return [];
    }
  }
);
