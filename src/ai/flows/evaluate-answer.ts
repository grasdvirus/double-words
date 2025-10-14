'use server';

/**
 * @fileOverview Flow to evaluate a user's answer in the game.
 *
 * - evaluateAnswer - Function to evaluate if the answer meets the game's challenge.
 * - EvaluateAnswerInput - Input type for the evaluateAnswer function.
 * - EvaluateAnswerOutput - Return type for the evaluateAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateAnswerInputSchema = z.object({
  wordOrPhrase: z.string().describe("The user's submitted word or phrase."),
  challenge: z
    .string()
    .describe('The required substring or pattern for the level (e.g., "ee").'),
  description: z
    .string()
    .describe('The description of the challenge for the level.'),
  language: z.enum(['FR', 'EN']).default('FR').describe('The language for the generated word and hint.'),
  solutionWord: z.string().optional().describe('An optional solution word for the level.'),
});

export type EvaluateAnswerInput = z.infer<typeof EvaluateAnswerInputSchema>;

const EvaluateAnswerOutputSchema = z.object({
  isValid: z
    .boolean()
    .describe('Whether the answer correctly includes the challenge.'),
  feedback: z
    .string()
    .describe(
      'A friendly and personalized feedback message for the user about their answer.'
    ),
  solutionWord: z.string().describe("A valid word that contains the challenge letters. It must be in uppercase and a single word without spaces."),
  hint: z.string().describe("A short hint, definition, or clue for the solutionWord to help the user guess it."),
});

export type EvaluateAnswerOutput = z.infer<typeof EvaluateAnswerOutputSchema>;

export async function evaluateAnswer(
  input: EvaluateAnswerInput
): Promise<EvaluateAnswerOutput> {
  return evaluateAnswerFlow(input);
}

const evaluateAnswerPrompt = ai.definePrompt({
  name: 'evaluateAnswerPrompt',
  input: {schema: EvaluateAnswerInputSchema},
  output: {schema: EvaluateAnswerOutputSchema},
  prompt: `You are a fun and encouraging game judge for a word game. The user has submitted a word or phrase to a challenge.

  The user's submission is: "{{wordOrPhrase}}"
  The challenge is: "{{description}}" (The required letters are: "{{challenge}}")
  The requested language is: {{language}}.

  Your task is to:
  1.  Check if the user's submission ("{{wordOrPhrase}}") contains the required challenge string ("{{challenge}}"). The check must be case-insensitive.
  2.  Set 'isValid' to true if it does, and false if it does not.
  3.  Write a short, friendly, and personalized 'feedback' message for the user in the requested language ({{language}}).
      - If the answer is invalid (doesn't contain "{{challenge}}"), the feedback should gently point it out and be encouraging.
      - If the answer is valid, the feedback should be positive and confirm they met the challenge.
  4. Generate a 'solutionWord'. This must be a single, simple, common, everyday word in the requested language ({{language}}) that contains the letters from the 'challenge' field. It must be in UPPERCASE and contain NO SPACES. If a 'solutionWord' is provided in the input, use that one. Otherwise, generate a new one.
  5. Generate a 'hint' for the 'solutionWord' in the requested language ({{language}}). The hint should be a short definition, a clue, or a sentence that helps the user guess the word.

  Analyze the user's submission and return the result.`,
});

const evaluateAnswerFlow = ai.defineFlow(
  {
    name: 'evaluateAnswerFlow',
    inputSchema: EvaluateAnswerInputSchema,
    outputSchema: EvaluateAnswerOutputSchema,
  },
  async input => {
    const {output} = await evaluateAnswerPrompt(input);
    return output!;
  }
);
