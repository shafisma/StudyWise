import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-4-hydrogen'),
});

export { googleAI };
