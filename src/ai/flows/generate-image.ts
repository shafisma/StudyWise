'use server';

/**
 * @fileOverview Generates an image from a text prompt.
 *
 * - generateImage - A function that handles the image generation process.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt for image generation.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageDataUri: z.string().describe('The generated image as a data URI.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async ({ prompt }) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `A vibrant, high-quality, professional illustration for a blog post about: ${prompt}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const imageDataUri = media?.url;
    if (!imageDataUri) {
      throw new Error('Image generation failed to produce an image.');
    }

    return { imageDataUri };
  }
);
