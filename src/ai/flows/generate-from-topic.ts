'use server';

/**
 * @fileOverview Generates study materials from a topic, including an image.
 *
 * - generateFromTopic - A function that generates notes, a quiz, flashcards, and an image from a given topic.
 * - GenerateFromTopicInput - The input type for the generateFromTopic function.
 * - GenerateFromTopicOutput - The return type for the generateFromTopic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFromTopicInputSchema = z.object({
  topic: z.string().describe('The topic to generate study materials for.'),
});
export type GenerateFromTopicInput = z.infer<typeof GenerateFromTopicInputSchema>;

const QuizQuestionSchema = z.object({
    question: z.string().describe('The question.'),
    options: z.array(z.string()).describe('An array of 4 multiple choice options.'),
    answer: z.string().describe('The correct answer. Must be one of the options.'),
});

const GenerateFromTopicOutputSchema = z.object({
  notes: z.string().describe('The generated notes in markdown format.'),
  quiz: z.object({
    questions: z.array(QuizQuestionSchema).describe('An array of quiz questions.'),
  }),
  flashcards: z.array(
    z.object({
      question: z.string().describe('The flashcard question.'),
      answer: z.string().describe('The flashcard answer.'),
    })
  ).describe('The generated flashcards.'),
  image: z.string().optional().describe('A data URI of a generated image relevant to the topic.'),
});
export type GenerateFromTopicOutput = z.infer<typeof GenerateFromTopicOutputSchema>;

export async function generateFromTopic(input: GenerateFromTopicInput): Promise<GenerateFromTopicOutput> {
  return generateFromTopicFlow(input);
}

const generateContentPrompt = ai.definePrompt({
  name: 'generateFromTopicContentPrompt',
  input: {schema: GenerateFromTopicInputSchema},
  output: {schema: GenerateFromTopicOutputSchema},
  prompt: `You are an expert educator and content creator. Your task is to generate a comprehensive set of study materials based on the provided topic.

The study materials should include:
1.  **Notes**: A summary of the key concepts, definitions, and important points about the topic. Format this as markdown.
2.  **Quiz**: A multiple-choice quiz with 5 questions to test understanding. Each question should have 4 options and a correct answer.
3.  **Flashcards**: A set of 5-10 flashcards with a clear question and a concise answer for key terms and concepts.

Topic: {{{topic}}}

Please provide the output in a single JSON object with the keys "notes", "quiz", and "flashcards". Do not include the "image" key in your response.
`,
});

const generateImageFlow = ai.defineFlow({
    name: 'generateTopicImageFlow',
    inputSchema: z.object({ topic: z.string() }),
    outputSchema: z.string(),
}, async ({ topic }) => {
    try {
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: `Generate an engaging and visually appealing cover image for study materials about "${topic}". The style should be modern, clean, and educational. Use a vibrant color palette. Minimalist or abstract styles are preferred.`,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });
        return media.url;
    } catch (e) {
        console.error("Image generation failed, returning empty string.", e);
        return "";
    }
});


const generateFromTopicFlow = ai.defineFlow(
  {
    name: 'generateFromTopicFlow',
    inputSchema: GenerateFromTopicInputSchema,
    outputSchema: GenerateFromTopicOutputSchema,
  },
  async input => {
    const [contentResponse, imageUri] = await Promise.all([
      generateContentPrompt(input),
      generateImageFlow(input)
    ]);
    
    const output = contentResponse.output;

    if (!output) {
      throw new Error("Failed to generate content from topic.");
    }

    return {
      ...output,
      image: imageUri,
    };
  }
);
