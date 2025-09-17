
'use server';
/**
 * @fileOverview A flow for sending booking notifications and saving bookings to Firestore.
 */
import { config } from 'dotenv';
config();

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as d from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { app } from '@/lib/firebase-admin'; // Using admin app
import * as nodemailer from 'nodemailer';

const db = getFirestore(app);

const NotificationInputSchema = z.object({
    customerName: z.string(),
    customerEmail: z.string(),
    customerPhone: z.string(),
    serviceName: z.string(),
    date: z.string(),
    time: z.string(),
    totalPrice: z.number(),
    addons: z.array(z.string()),
    receiptDataUri: z.string().optional(),
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
    
    // Step 1: Save booking to Firestore. This is the most critical step.
    try {
        const bookingData = {
            ...input,
            createdAt: d.FieldValue.serverTimestamp(), // Add a server timestamp
            status: 'confirmed', // Default status
        };
        // We don't want to store the large image data URI in the main document
        if ('receiptDataUri' in bookingData) {
            delete (bookingData as Partial<typeof bookingData>).receiptDataUri;
        }

        const bookingRef = await db.collection('bookings').add(bookingData);
        console.log('Booking saved successfully with ID:', bookingRef.id);
    } catch (error) {
        console.error("CRITICAL: Failed to save booking to Firestore:", error);
        // If we can't save the booking, we must stop and report the error.
        return { success: false, message: "A critical error occurred while trying to save your booking. Please try again." };
    }

    // Step 2: Attempt to send email notification. This is non-critical.
    // Check for required environment variables for email
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        const message = "Booking saved successfully. Email notifications are not configured on the server. Please proceed with WhatsApp notification.";
        console.warn(message);
        // Return success because the booking was saved.
        return { success: true, message: message }; 
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10),
        secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const addonsEmail = input.addons.length > 0 
        ? `<ul>${input.addons.map(a => `<li>${a}</li>`).join('')}</ul>`
        : 'None';
        
    const emailHtml = `
      <h1>New Booking Notification!</h1>
      <p>A client has booked an appointment and uploaded their payment receipt.</p>
      <h2>Client Details:</h2>
      <ul>
        <li><strong>Name:</strong> ${input.customerName}</li>
        <li><strong>Email:</strong> ${input.customerEmail}</li>
        <li><strong>Phone:</strong> ${input.customerPhone}</li>
      </ul>
      <h2>Booking Details:</h2>
      <ul>
        <li><strong>Service:</strong> ${input.serviceName}</li>
        <li><strong>Date:</strong> ${input.date}</li>
        <li><strong>Time:</strong> ${input.time}</li>
        <li><strong>Total Price:</strong> $${input.totalPrice.toFixed(2)}</li>
      </ul>
       <h2>Add-ons:</h2>
      ${addonsEmail}
      <p>The client has uploaded their payment receipt. Please check your records.</p>
    `;

    try {
        await transporter.sendMail({
            from: `"F&G Luxury Hair" <${process.env.EMAIL_USER}>`,
            to: "kingsleyfrancis.kalu@gmail.com",
            subject: `New Booking: ${input.serviceName} for ${input.customerName}`,
            html: emailHtml,
            attachments: input.receiptDataUri ? [{
                filename: 'receipt.png',
                path: input.receiptDataUri,
            }] : [],
        });
        
        // Success, booking saved and email sent.
        return { success: true, message: "Booking saved and email notification sent successfully." };

    } catch (error) {
        console.error("Failed to send email:", error);
        
        // IMPORTANT: Still return success=true because the booking was saved.
        // The message will inform the user about the email issue.
        const errorMessage = (error as Error).message.includes('Invalid login') 
            ? "Booking saved, but email failed: Authentication error. Check server credentials. Please proceed with WhatsApp notification."
            : `Booking saved, but the email notification could not be sent. Please proceed with WhatsApp notification.`;

        return { success: true, message: errorMessage };
    }
  }
);
