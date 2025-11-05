
'use server';
/**
 * @fileOverview A flow for sending a booking confirmation email to the client.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import gmailSend from 'gmail-send';

// Define the input schema for the email flow
const EmailInputSchema = z.object({
  customerName: z.string().describe('The name of the customer.'),
  customerEmail: z.string().email().describe('The email address of the customer.'),
  serviceName: z.string().describe('The name of the service booked.'),
  date: z.string().describe('The date of the appointment.'),
});
export type EmailInput = z.infer<typeof EmailInputSchema>;

const EmailOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type EmailOutput = z.infer<typeof EmailOutputSchema>;


// This is the exported function that will be called from the client-side
export async function sendConfirmationEmail(input: EmailInput): Promise<EmailOutput> {
  return sendConfirmationEmailFlow(input);
}


// Define the prompt for generating the email body
const emailPrompt = ai.definePrompt({
  name: 'generateConfirmationEmail',
  input: { schema: EmailInputSchema },
  prompt: `
    Generate a plain text email body for a salon appointment confirmation.
    The output should be plain text, not HTML.
    Use the following template exactly, replacing the placeholders with the provided values.

    Hi {{customerName}},

    Your appointment for {{serviceName}} on {{date}} is confirmed!

    Address: 13130 Doty Ave apt 9 Hawthorn ca 90250, Phone: (323) 471-8770.

    Please remember to arrive with your hair washed and blow-dried.

    Best regards,
    The F&G Luxury Hair Team.
  `,
});

// Define the main flow
const sendConfirmationEmailFlow = ai.defineFlow(
  {
    name: 'sendConfirmationEmailFlow',
    inputSchema: EmailInputSchema,
    outputSchema: EmailOutputSchema,
  },
  async (input) => {
    
    // Generate the email body using the AI prompt
    const response = await emailPrompt(input);
    const emailText = response.text;

    if (!emailText) {
        throw new Error("Could not generate email body.");
    }
    
    // The logo URL
    const logoUrl = "https://v0-hair-salon-website-design-six.vercel.app/images/fg-luxury-hairs-logo.png";
    
    // Convert plain text newlines to <br> for HTML email
    const htmlBody = emailText.replace(/\n/g, '<br>');

    // Full HTML with embedded logo and styling
    const fullHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background-color: #0A0A0A; color: #D97706;">
        <div style="background-color: #000; padding: 20px; text-align: center;">
          <img src="${logoUrl}" alt="F&G Luxury Hair Logo" style="max-width: 150px;">
        </div>
        <div style="padding: 20px; line-height: 1.6;">
          ${htmlBody}
        </div>
      </div>
    `;
    
    const send = gmailSend({
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
        to: input.customerEmail,
        subject: 'Your F&G Luxury Hair Appointment is Confirmed!',
        html: fullHtml
    });

    try {
        const { result } = await send();
        console.log(`Confirmation email sent to ${input.customerEmail}: ${result}`);
        return { success: true, message: 'Confirmation email sent successfully.' };

    } catch (error) {
        console.error('Failed to send email:', error);
        // This will be caught by the calling function in the admin dashboard
        throw new Error(`Failed to send email to ${input.customerEmail}.`);
    }
  }
);
