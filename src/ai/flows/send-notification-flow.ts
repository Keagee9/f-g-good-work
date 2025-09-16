
'use server';
/**
 * @fileOverview A flow for sending booking notifications.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as nodemailer from 'nodemailer';

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
    
    // Check for required environment variables
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        const message = "Email environment variables (EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS) are not set. Please configure them in your .env file to enable email notifications.";
        console.error(message);
        return { success: false, message: message };
    }

    // Email Notification
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
            to: "goodnessabengowe8@gmail.com",
            subject: `New Booking: ${input.serviceName} for ${input.customerName}`,
            html: emailHtml,
            attachments: input.receiptDataUri ? [{
                filename: 'receipt.png',
                path: input.receiptDataUri,
            }] : [],
        });
        
        return { success: true, message: "Email notification sent successfully." };

    } catch (error) {
        console.error("Failed to send email:", error);
        return { success: false, message: "Failed to send email notification. Please check server logs and that your environment variables are correct." };
    }
  }
);
