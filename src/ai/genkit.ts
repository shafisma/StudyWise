import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-4-hydrogen'),
});

export { googleAI };
