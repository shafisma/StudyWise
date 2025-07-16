'use server';
/**
 * @fileOverview An AI agent for generating exams.
 *
 * - generateExam - A function that handles the exam generation process.
 */

import { ai } from '@/ai/genkit';
import { GenerateExamInputSchema, type GenerateExamInput, GenerateExamOutputSchema, type GenerateExamOutput } from '@/ai/schemas/exam-schemas';

export async function generateExam(input: GenerateExamInput): Promise<GenerateExamOutput> {
  return generateExamFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExamPrompt',
  input: { schema: GenerateExamInputSchema },
  output: { schema: GenerateExamOutputSchema },
  prompt: `You are an expert educator and exam creator. Your task is to generate a comprehensive exam paper based on the provided specifications.

  **CRITICAL INSTRUCTIONS:**
  1. The sum of marks for all generated questions *MUST* exactly equal the 'totalMarks' specified. This is the most important rule. Do not deviate.
  2. You must determine a 'timeLimitMinutes'. This time limit should be **strict and competitive**, providing a challenging but fair timeframe for a student at the specified grade level. Do not be overly generous with the time.

  Specifications:
  - Subject: {{{subject}}}
  - Grade/Level: {{{grade}}}
  - Chapters/Topics: {{{chapters}}}
  - Total Marks: {{{totalMarks}}}
  - Question Types to Include: {{#each questionTypes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Your goal is to create a balanced exam paper that adheres to the total marks and has a competitive time limit.

  Here are your instructions:
  1.  **Create a Title:** Generate a suitable title for the exam paper.
  2.  **Determine Time Limit:** Based on the complexity, number of questions, and total marks, determine and suggest a reasonable but strict time limit in minutes.
  3.  **Write Instructions:** Provide a clear set of general instructions for the students taking the exam.
  4.  **Generate Questions:**
      - Create a list of questions that match the specified types ({{#each questionTypes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}).
      - For each question, provide the full question text, its type, the allocated marks, and the correct answer.
      - For 'mcq' questions, you MUST provide an array of 4 distinct options, and the 'correct_answer' must be one of these options.
      - **REITERATION:** The sum of marks for all questions you create MUST equal the 'totalMarks' ({{{totalMarks}}}). Double-check this.
      - Ensure the difficulty of the questions is appropriate for the specified grade level ({{{grade}}}).
      - Ensure all questions are relevant to the specified subject ({{{subject}}}) and chapters/topics ({{{chapters}}}).

  Please provide the output in a single JSON object with the keys "title", "timeLimitMinutes", "instructions", and "questions".
  `,
});

const generateExamFlow = ai.defineFlow(
  {
    name: 'generateExamFlow',
    inputSchema: GenerateExamInputSchema,
    outputSchema: GenerateExamOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate the exam paper.');
    }
    
    return output;
  }
);
