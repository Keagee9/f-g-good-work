
'use server';
/**
 * @fileOverview A flow for sending a booking confirmation email to the client.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import GMailer from 'gmail-send';

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
    Generate a friendly and professional confirmation email for a hair salon appointment.
    The email should be in HTML format.
    
    Here's the structure:
    - Start with a greeting to the customer: "Hi {{customerName}},"
    - Confirm their appointment with the service name and date: "Your appointment for {{serviceName}} on {{date}} is confirmed!"
    - Include the salon's contact information: "Address: 13130 Doty Ave apt 9 Hawthorn ca 90250", "Phone: (323) 471-8770".
    - Remind them of the policy: "Please remember to arrive with your hair washed and blow-dried. We look forward to seeing you!"
    - End with a professional closing: "Best regards," followed by "The F&G Luxury Hair Team".
    - Wrap the entire content in a visually appealing HTML structure with basic styling. Center the main content and include the company logo.
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
    const { output: htmlBody } = await emailPrompt(input);

    if (!htmlBody) {
        throw new Error("Could not generate email body.");
    }
    
    // The logo URL
    const logoUrl = "https://v0-hair-salon-website-design-six.vercel.app/images/fg-luxury-hairs-logo.png";
    
    // Full HTML with embedded logo
    const fullHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #000; padding: 20px; text-align: center;">
          <img src="${logoUrl}" alt="F&G Luxury Hair Logo" style="max-width: 150px;">
        </div>
        <div style="padding: 20px; color: #333;">
          ${htmlBody}
        </div>
      </div>
    `;
    
    const send = GMailer({
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
