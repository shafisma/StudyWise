'use server';

/**
 * @fileOverview Explains a topic in simple terms.
 *
 * - explainLikeImFive - A function that explains a topic simply.
 * - ExplainLikeImFiveInput - The input type for the function.
 * - ExplainLikeImFiveOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainLikeImFiveInputSchema = z.object({
  topic: z.string().describe('The topic to explain.'),
});
export type ExplainLikeImFiveInput = z.infer<typeof ExplainLikeImFiveInputSchema>;

const ExplainLikeImFiveOutputSchema = z.object({
  explanation: z.string().describe('The simple explanation of the topic, formatted in markdown.'),
  imageHint: z.string().optional().describe('A one or two word hint for a relevant image search query.'),
});
export type ExplainLikeImFiveOutput = z.infer<typeof ExplainLikeImFiveOutputSchema>;

export async function explainLikeImFive(input: ExplainLikeImFiveInput): Promise<ExplainLikeImFiveOutput> {
    return eli5Flow(input);
}

const generateContentPrompt = ai.definePrompt({
    name: 'eli5Prompt',
    input: { schema: ExplainLikeImFiveInputSchema },
    output: { schema: ExplainLikeImFiveOutputSchema },
    prompt: `You are an expert at explaining complex topics in a simple and easy-to-understand way.
    
    Your task is to:
    1. Explain the following topic as if you were talking to a 5-year-old. Use simple words, short sentences, and relatable analogies. Format the output as markdown.
    2. Provide a 1-2 word hint for an image search that would create a cute, simple, and friendly illustration for a 5-year-old that visually represents the topic. For example, for "Black holes" you could provide "black hole".

    Topic: {{{topic}}}
    `,
});


const eli5Flow = ai.defineFlow(
  {
    name: 'eli5Flow',
    inputSchema: ExplainLikeImFiveInputSchema,
    outputSchema: ExplainLikeImFiveOutputSchema,
  },
  async (input) => {
    const { output } = await generateContentPrompt(input);
    
    if (!output) {
      throw new Error("Failed to generate explanation.");
    }

    return output;
  }
);
