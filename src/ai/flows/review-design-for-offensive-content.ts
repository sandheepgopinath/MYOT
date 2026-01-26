'use server';

/**
 * @fileOverview Reviews a user-submitted design for offensive content.
 *
 * - reviewDesignForOffensiveContent - A function that reviews the design for offensive content.
 * - ReviewDesignInput - The input type for the reviewDesignForOffensiveContent function.
 * - ReviewDesignOutput - The return type for the reviewDesignForOffensiveContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReviewDesignInputSchema = z.object({
  designDataUri: z
    .string()
    .describe(
      "A design, either uploaded or created in the application, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  customText: z.string().optional().describe('Optional custom text added to the design.'),
});
export type ReviewDesignInput = z.infer<typeof ReviewDesignInputSchema>;

const ReviewDesignOutputSchema = z.object({
  isSafe: z
    .boolean()
    .describe(
      'Whether the design and text are safe for production, meaning it does not contain offensive or copyrighted material.'
    ),
  reason: z
    .string()
    .optional()
    .describe(
      'If the design is not safe, this field explains why.  If the design is safe, this field is not populated.'
    ),
});
export type ReviewDesignOutput = z.infer<typeof ReviewDesignOutputSchema>;

export async function reviewDesignForOffensiveContent(
  input: ReviewDesignInput
): Promise<ReviewDesignOutput> {
  return reviewDesignFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reviewDesignPrompt',
  input: {schema: ReviewDesignInputSchema},
  output: {schema: ReviewDesignOutputSchema},
  prompt: `You are an AI assistant specializing in detecting offensive content and copyright infringements in T-shirt designs.

You will review a T-shirt design, taking into account any user-provided text, and determine if it is safe for printing.  A design is considered unsafe if it contains:

*   Obscene imagery or text
*   Hate speech targeting any group or individual
*   Insulting or disparaging content related to any religion
*   Copyrighted material (logos, characters, etc.)

If the design is safe, return isSafe=true and do not populate the reason field.
If the design is unsafe, return isSafe=false and explain the reason why it is unsafe.

Design: {{media url=designDataUri}}
Text: {{{customText}}}`,
});

const reviewDesignFlow = ai.defineFlow(
  {
    name: 'reviewDesignFlow',
    inputSchema: ReviewDesignInputSchema,
    outputSchema: ReviewDesignOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
