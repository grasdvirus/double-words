import { config } from 'dotenv';
config();

import '@/ai/flows/check-originality.ts';
import '@/ai/flows/evaluate-answer.ts';
import '@/ai/flows/generate-duel-challenge.ts';
