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
  image: z.string().optional().describe('A data URI of a generated image relevant to the topic.'),
});
export type ExplainLikeImFiveOutput = z.infer<typeof ExplainLikeImFiveOutputSchema>;

export async function explainLikeImFive(input: ExplainLikeImFiveInput): Promise<ExplainLikeImFiveOutput> {
    return eli5Flow(input);
}

const generateExplanationPrompt = ai.definePrompt({
    name: 'eli5Prompt',
    input: { schema: ExplainLikeImFiveInputSchema },
    output: { schema: z.object({ explanation: z.string() }) },
    prompt: `You are an expert at explaining complex topics in a simple and easy-to-understand way.
    
    Explain the following topic as if you were talking to a 5-year-old. Use simple words, short sentences, and relatable analogies. Format the output as markdown.

    Topic: {{{topic}}}
    `,
});

const generateImageFlow = ai.defineFlow({
    name: 'eli5ImageFlow',
    inputSchema: z.object({ topic: z.string() }),
    outputSchema: z.string(),
}, async ({ topic }) => {
    try {
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: `Generate a cute, simple, and friendly illustration for a 5-year-old that visually represents the topic of "${topic}". Use bright, happy colors and a cartoon style.`,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });
        return media.url;
    } catch (e) {
        console.error("ELI5 image generation failed, returning empty string.", e);
        return "";
    }
});


const eli5Flow = ai.defineFlow(
  {
    name: 'eli5Flow',
    inputSchema: ExplainLikeImFiveInputSchema,
    outputSchema: ExplainLikeImFiveOutputSchema,
  },
  async (input) => {
    const [explanationResponse, imageUri] = await Promise.all([
        generateExplanationPrompt(input),
        generateImageFlow(input)
    ]);
    
    const output = explanationResponse.output;

    if (!output) {
      throw new Error("Failed to generate explanation.");
    }

    return {
      explanation: output.explanation,
      image: imageUri,
    };
  }
);
