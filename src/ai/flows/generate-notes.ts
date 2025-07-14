'use server';

/**
 * @fileOverview Generates notes from input text or YouTube video.
 *
 * - generateNotes - A function that generates notes from the input.
 * - GenerateNotesInput - The input type for the generateNotes function.
 * - GenerateNotesOutput - The return type for the generateNotes function.
 */

import {ai} from '@/ai/genkit';
import { getYouTubeTranscript } from '@/services/youtube';
import {z} from 'genkit';

const GenerateNotesInputSchema = z.object({
  text: z.string().optional().describe('The text to generate notes from.'),
  youtubeUrl: z.string().optional().describe('A YouTube video URL to generate notes from.'),
});
export type GenerateNotesInput = z.infer<typeof GenerateNotesInputSchema>;

const GenerateNotesOutputSchema = z.object({
  notes: z.string().describe('The generated notes.'),
});
export type GenerateNotesOutput = z.infer<typeof GenerateNotesOutputSchema>;

export async function generateNotes(input: GenerateNotesInput): Promise<GenerateNotesOutput> {
  return generateNotesFlow(input);
}

const generateNotesPrompt = ai.definePrompt({
  name: 'generateNotesPrompt',
  input: { schema: z.object({ content: z.string() }) },
  output: {schema: GenerateNotesOutputSchema},
  prompt: `You are an expert note-taker. Generate detailed, well-structured, and easy-to-understand notes from the following content. Use markdown for formatting, including headings, lists, and bold text to highlight key points.

  Content to analyze:
  {{{content}}}
  `,
});

const generateNotesFlow = ai.defineFlow(
  {
    name: 'generateNotesFlow',
    inputSchema: GenerateNotesInputSchema,
    outputSchema: GenerateNotesOutputSchema,
  },
  async input => {
    let content = input.text || '';
    
    if (input.youtubeUrl) {
        try {
            content = await getYouTubeTranscript(input.youtubeUrl);
        } catch (e) {
            console.error("Failed to get YouTube transcript", e);
            throw new Error("Could not get transcript for the provided YouTube URL. The video might not have subtitles enabled.");
        }
    }

    if (!content) {
        throw new Error("No content provided to generate notes.");
    }
    
    const {output} = await generateNotesPrompt({ content });
    return output!;
  }
);
