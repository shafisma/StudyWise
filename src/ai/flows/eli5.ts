'use server';

/**
 * @fileOverview Explains a topic in simple terms from various sources.
 *
 * - explainLikeImFive - A function that explains content simply.
 * - ExplainLikeImFiveInput - The input type for the function.
 * - ExplainLikeImFiveOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainLikeImFiveInputSchema = z.object({
  text: z.string().optional().describe('The text content to explain.'),
  imageDataUri: z
    .string()
    .optional()
    .describe(
      "An image for OCR analysis, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  youtubeUrl: z.string().optional().describe('A YouTube video URL to summarize and explain.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('easy').describe("The difficulty level for the explanation. 'easy' is for a 5-year-old.")
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
    
    Your task is to analyze the provided content and:
    1. Explain it based on the requested difficulty level. Use simple words, short sentences, and relatable analogies for 'easy'. For 'medium', assume a high school level of understanding. For 'hard', assume a college level. Format the output as markdown.
    2. Provide a 1-2 word hint for an image search that would create a relevant illustration for the topic.

    Content to Explain:
    {{#if text}}Text: {{{text}}}{{/if}}
    {{#if imageDataUri}}{{media url=imageDataUri}}{{/if}}
    {{#if youtubeUrl}}YouTube URL (imagine you have summarized it): {{{youtubeUrl}}}{{/if}}

    Difficulty: {{{difficulty}}}
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
