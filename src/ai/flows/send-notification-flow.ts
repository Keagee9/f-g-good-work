
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
    // This function is no longer needed as the WhatsApp link is opened directly.
    // However, we can keep the flow in case we want to add other notifications (e.g., email) later.
    console.log('Notification data prepared:', input);
    return Promise.resolve({ success: true, message: 'Client-side notification handled.' });
}

const sendNotificationFlow = ai.defineFlow(
  {
    name: 'sendNotificationFlow',
    inputSchema: NotificationInputSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async (input) => {
    // This flow no longer saves to Firestore and is not awaited by the client.
    // It's here for potential future use (e.g., sending an email confirmation).
    console.log('Server-side notification flow triggered for:', input.customerName);
    // For example, one could add an email sending service here.
    return { success: true, message: "Server-side flow executed successfully." };
  }
);

    