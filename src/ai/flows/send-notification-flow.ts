
'use server';
/**
 * @fileOverview A flow for sending booking notifications.
 * This flow is now only responsible for constructing the WhatsApp message.
 * The booking is saved to Firestore on the client-side.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const NotificationInputSchema = z.object({
    customerName: z.string(),
    customerEmail: z.string(),
    customerPhone: z.string(),
    serviceName: z.string(),
    date: z.string(),
    time: z.string(),
    totalPrice: z.number(),
    addons: z.array(z.string()),
});
export type NotificationInput = z.infer<typeof NotificationInputSchema>;

export async function sendNotification(input: NotificationInput): Promise<{ success: boolean; message: string }> {
    return sendNotificationFlow(input);
}

const sendNotificationFlow = ai.defineFlow(
  {
    name: 'sendNotificationFlow',
    inputSchema: NotificationInputSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async (input) => {
    // This flow no longer saves to Firestore.
    // It just confirms that the notification logic was triggered.
    // The actual WhatsApp message is constructed and opened on the client.
    console.log('Notification flow triggered for:', input.customerName);
    return { success: true, message: "Notification flow executed successfully." };
  }
);
