'use server';

/**
 * @fileOverview Flow to check the originality of a word or phrase and award bonus points.
 *
 * - checkOriginality - Function to check if a word/phrase is original and return a bonus.
 * - CheckOriginalityInput - Input type for the checkOriginality function.
 * - CheckOriginalityOutput - Return type for the checkOriginality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckOriginalityInputSchema = z.object({
  wordOrPhrase: z
    .string()
    .describe('The word or phrase to check for originality.'),
  previousWordsAndPhrases: z
    .array(z.string())
    .describe('An array of previously used words and phrases.'),
});

export type CheckOriginalityInput = z.infer<typeof CheckOriginalityInputSchema>;

const CheckOriginalityOutputSchema = z.object({
  isOriginal: z.boolean().describe('Whether the word or phrase is original.'),
  bonusPoints: z
    .number()
    .describe('Bonus points awarded for originality (0 if not original).'),
});

export type CheckOriginalityOutput = z.infer<typeof CheckOriginalityOutputSchema>;

export async function checkOriginality(input: CheckOriginalityInput): Promise<CheckOriginalityOutput> {
  return checkOriginalityFlow(input);
}

const checkOriginalityPrompt = ai.definePrompt({
  name: 'checkOriginalityPrompt',
  input: {schema: CheckOriginalityInputSchema},
  output: {schema: CheckOriginalityOutputSchema},
  prompt: `You are a game master assessing the originality of words and phrases in a word game.

  Determine if the word or phrase: "{{wordOrPhrase}}" is original, given the following list of previously used words and phrases:

  {{#each previousWordsAndPhrases}}
  - "{{this}}"
  {{/each}}

  Return isOriginal as true if the word or phrase has not been used before; otherwise, return false.
  Award 5 bonus points if the word or phrase is original, otherwise award 0 bonus points.
  `,
});

const checkOriginalityFlow = ai.defineFlow(
  {
    name: 'checkOriginalityFlow',
    inputSchema: CheckOriginalityInputSchema,
    outputSchema: CheckOriginalityOutputSchema,
  },
  async input => {
    const {output} = await checkOriginalityPrompt(input);
    return output!;
  }
);
