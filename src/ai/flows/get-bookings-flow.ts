
'use server';
/**
 * @fileOverview A flow for fetching all bookings from Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as admin from 'firebase-admin';

// This is a "singleton" pattern. It ensures that we only initialize
// the Firebase Admin SDK once, preventing errors from trying to
// re-initialize it on every server-side render in Next.js.
function getDb(): admin.firestore.Firestore {
  // If the app is already initialized, return the existing instance.
  if (admin.apps.length > 0) {
    return admin.app().firestore();
  }
  
  // If the app is not initialized, create a new instance and return it.
  admin.initializeApp({
    projectId: 'studio-2472646169-beca8',
  });
  return admin.app().firestore();
}


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
    const db = getDb();
    
    try {
      const bookingsSnapshot = await db.collection('bookings').get();
      const bookings: Booking[] = [];

      if (bookingsSnapshot.empty) {
        return [];
      }

      bookingsSnapshot.forEach(doc => {
        const data = doc.data();
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
      return [];
    }
  }
);
