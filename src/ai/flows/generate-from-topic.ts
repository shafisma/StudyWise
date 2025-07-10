'use server';

/**
 * @fileOverview Generates study materials from a topic.
 *
 * - generateFromTopic - A function that generates notes, a quiz, and flashcards from a given topic.
 * - GenerateFromTopicInput - The input type for the generateFromTopic function.
 * - GenerateFromTopicOutput - The return type for the generateFromTopic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFromTopicInputSchema = z.object({
  topic: z.string().describe('The topic to generate study materials for.'),
});
export type GenerateFromTopicInput = z.infer<typeof GenerateFromTopicInputSchema>;

const GenerateFromTopicOutputSchema = z.object({
  notes: z.string().describe('The generated notes in markdown format.'),
  quiz: z.string().describe('The generated quiz questions and answers.'),
  flashcards: z.array(
    z.object({
      question: z.string().describe('The flashcard question.'),
      answer: z.string().describe('The flashcard answer.'),
    })
  ).describe('The generated flashcards.'),
});
export type GenerateFromTopicOutput = z.infer<typeof GenerateFromTopicOutputSchema>;

export async function generateFromTopic(input: GenerateFromTopicInput): Promise<GenerateFromTopicOutput> {
  return generateFromTopicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFromTopicPrompt',
  input: {schema: GenerateFromTopicInputSchema},
  output: {schema: GenerateFromTopicOutputSchema},
  prompt: `You are an expert educator and content creator. Your task is to generate a comprehensive set of study materials based on the provided topic.

The study materials should include:
1.  **Notes**: A summary of the key concepts, definitions, and important points about the topic. Format this as markdown.
2.  **Quiz**: A multiple-choice quiz with 5 questions to test understanding. Format this as a plain text string. Each question should be on a new line, followed by options (A, B, C, D) on their own lines, and finally the correct answer on its own line starting with "Answer:". Separate each question block with a blank line.
3.  **Flashcards**: A set of 5-10 flashcards with a clear question and a concise answer for key terms and concepts.

Topic: {{{topic}}}

Please provide the output in a single JSON object with the keys "notes", "quiz", and "flashcards".
`,
});

const generateFromTopicFlow = ai.defineFlow(
  {
    name: 'generateFromTopicFlow',
    inputSchema: GenerateFromTopicInputSchema,
    outputSchema: GenerateFromTopicOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
