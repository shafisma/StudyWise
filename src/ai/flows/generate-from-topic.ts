'use server';

/**
 * @fileOverview Generates study materials from a topic, including an image hint.
 *
 * - generateFromTopic - A function that generates notes, a quiz, flashcards, and an image hint from a given topic.
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
    emoji: z.string().optional().describe('A single emoji related to the question.'),
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
      emoji: z.string().describe('A single, valid emoji character relevant to the flashcard content. Example: "🧠"'),
      color: z.string().describe('A hex color code for the flashcard background (e.g., #FFFFFF).'),
    })
  ).describe('The generated flashcards.'),
  imageHint: z.string().optional().describe('A one or two word hint for a relevant image search query.'),
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
2.  **Quiz**: A multiple-choice quiz with 5 questions to test understanding. Each question should have 4 options, a correct answer, and a single relevant emoji.
3.  **Flashcards**: A set of 5-10 flashcards. For each flashcard, provide a clear "question", a concise "answer", a single, valid "emoji" character, and a "color" as a hex code.
4.  **Image Hint**: A 1-2 word hint for a web search for a cover image for these study materials. For example, for "The basics of photosynthesis" you could provide "photosynthesis basics".

Topic: {{{topic}}}

Please provide the output in a single JSON object with the keys "notes", "quiz", "flashcards", and "imageHint".
`,
});


const generateFromTopicFlow = ai.defineFlow(
  {
    name: 'generateFromTopicFlow',
    inputSchema: GenerateFromTopicInputSchema,
    outputSchema: GenerateFromTopicOutputSchema,
  },
  async input => {
    const {output} = await generateContentPrompt(input);

    if (!output) {
      throw new Error("Failed to generate content from topic.");
    }

    return output;
  }
);
