'use server';

/**
 * @fileOverview Flow to generate a unique challenge for a duel round.
 *
 * - generateDuelChallenge - Function to generate a word, hint, and challenge.
 * - GenerateDuelChallengeInput - Input type for the function.
 * - GenerateDuelChallengeOutput - Return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDuelChallengeInputSchema = z.object({
  existingWords: z
    .array(z.string())
    .describe('An array of words already used in the duel to avoid repetition.'),
  language: z.enum(['FR', 'EN']).default('FR').describe('The language for the generated word and hint.'),
});

export type GenerateDuelChallengeInput = z.infer<typeof GenerateDuelChallengeInputSchema>;

const GenerateDuelChallengeOutputSchema = z.object({
  challenge: z.string().length(2).describe('A two-letter substring challenge derived from the solution word (e.g., "ON").'),
  description: z.string().describe('A human-readable description for the challenge (e.g., \'Contient "on"\').'),
  solutionWord: z.string().min(5).describe("A single, valid word or a well-known phrase in the requested language. It must be in UPPERCASE."),
  hint: z.string().describe("A short hint, definition, or clue for the solutionWord to help the user guess it."),
});

export type GenerateDuelChallengeOutput = z.infer<typeof GenerateDuelChallengeOutputSchema>;

export async function generateDuelChallenge(input: GenerateDuelChallengeInput): Promise<GenerateDuelChallengeOutput> {
  return generateDuelChallengeFlow(input);
}

const generateDuelChallengePrompt = ai.definePrompt({
  name: 'generateDuelChallengePrompt',
  input: {schema: GenerateDuelChallengeInputSchema},
  output: {schema: GenerateDuelChallengeOutputSchema},
  prompt: `You are a creative game master for a word duel. Your task is to generate a new, unique, and engaging challenge for a round.

  The requested language is: {{language}}.
  The following words have already been used in this duel and must not be repeated:
  {{#each existingWords}}
  - "{{this}}"
  {{/each}}

  Please perform the following steps:
  1.  Generate a new 'solutionWord'. This should be a single, common word or a very well-known phrase in the requested language ({{language}}), with a minimum length of 5 letters. It must NOT be in the list of existing words. Prioritize famous expressions, movie titles, or common knowledge. The word must be in UPPERCASE.
  2.  From the 'solutionWord', extract a 'challenge' which is a two-letter (2) substring from that word. For example, if the word is "BONJOUR", a valid challenge would be "ON", "BO", or "UR".
  3.  Create a 'description' for the challenge. For example, if the challenge is "ON", the description should be 'Contient "on"'.
  4.  Generate a short, clever 'hint' for the 'solutionWord' in the requested language ({{language}}). The hint should be a definition, a clue, or a sentence that helps players guess the word.

  Return the complete challenge object.`,
});

const generateDuelChallengeFlow = ai.defineFlow(
  {
    name: 'generateDuelChallengeFlow',
    inputSchema: GenerateDuelChallengeInputSchema,
    outputSchema: GenerateDuelChallengeOutputSchema,
  },
  async input => {
    const {output} = await generateDuelChallengePrompt(input);
    return output!;
  }
);
