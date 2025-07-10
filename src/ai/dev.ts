import { config } from 'dotenv';
config();

import '@/ai/flows/generate-quiz.ts';
import '@/ai/flows/generate-notes.ts';
import '@/ai/flows/generate-flashcards.ts';
import '@/ai/flows/generate-from-topic.ts';
import '@/ai/flows/eli5.ts';
