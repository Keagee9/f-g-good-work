'use server';

/**
 * @fileOverview An AI agent that suggests braid styles based on a user-uploaded photo.
 *
 * - suggestBraidStyle - A function that handles the braid style suggestion process.
 * - StyleSuggestionInput - The input type for the suggestBraidStyle function.
 * - StyleSuggestionOutput - The return type for the suggestBraidStyle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StyleSuggestionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type StyleSuggestionInput = z.infer<typeof StyleSuggestionInputSchema>;

const StyleSuggestionOutputSchema = z.object({
  suggestedStyles: z
    .array(z.string())
    .describe('An array of suggested braid styles.'),
  reasoning: z
    .string()
    .describe(
      'The AI’s reasoning for suggesting these styles, based on the user’s face and hair type.'
    ),
});
export type StyleSuggestionOutput = z.infer<typeof StyleSuggestionOutputSchema>;

export async function suggestBraidStyle(
  input: StyleSuggestionInput
): Promise<StyleSuggestionOutput> {
  return suggestBraidStyleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBraidStylePrompt',
  input: {schema: StyleSuggestionInputSchema},
  output: {schema: StyleSuggestionOutputSchema},
  prompt: `You are a professional hair stylist, expert in braid styles. A user will upload a photo of themselves, and you will suggest braid styles that would suit their face and hair type.

Analyze the photo and consider face shape, hair texture, and overall appearance to provide personalized recommendations.

Photo: {{media url=photoDataUri}}

Provide an array of suggested braid styles, and a detailed explanation of why you think these styles would be a good fit for the user.

Output the array of suggested braid styles, and the reasoning.`,
});

const suggestBraidStyleFlow = ai.defineFlow(
  {
    name: 'suggestBraidStyleFlow',
    inputSchema: StyleSuggestionInputSchema,
    outputSchema: StyleSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
