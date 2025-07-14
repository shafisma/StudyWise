import { config } from 'dotenv';
config();

import '@/ai/flows/generate-quiz.ts';
import '@/ai/flows/generate-notes.ts';
import '@/ai/flows/generate-flashcards.ts';
import '@/ai/flows/generate-from-topic.ts';
import '@/ai/flows/eli5.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/generate-exam.ts';
import '@/ai/flows/evaluate-exam.ts';
import '@/ai/flows/generate-image.ts';
