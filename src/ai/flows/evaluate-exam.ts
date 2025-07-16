'use server';
/**
 * @fileOverview An AI agent for evaluating user exam answers.
 *
 * - evaluateExam - A function that handles the exam evaluation process.
 */

import { ai } from '@/ai/genkit';
import {
  EvaluateExamInputSchema,
  type EvaluateExamInput,
  EvaluateExamOutputSchema,
  type EvaluateExamOutput,
} from '@/ai/schemas/evaluation-schemas';

export async function evaluateExam(input: EvaluateExamInput): Promise<EvaluateExamOutput> {
  return evaluateExamFlow(input);
}

const getGrade = (score: number, totalMarks: number): string => {
    if (totalMarks === 0) return 'N/A';
    const percentage = (score / totalMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
}

const prompt = ai.definePrompt({
  name: 'evaluateExamPrompt',
  input: { schema: EvaluateExamInputSchema },
  output: { schema: EvaluateExamOutputSchema },
  prompt: `You are an expert examiner AI. Your task is to evaluate a user's submitted answers for an exam and provide constructive feedback.

  Here is the exam content and the user's answers. Note that questions are 0-indexed.

  **Exam Questions and Correct Answers:**
  {{#each examQuestions}}
  - **Question {{#if @index}}{{@index}}{{else}}0{{/if}}:** {{this.question_text}} ({{this.question_type}}, {{this.marks}} marks)
    - **Correct Answer:** {{this.correct_answer}}
    {{#if this.options}}- **Options:** {{#each this.options}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
  {{/each}}

  **User's Submitted Answers:**
  {{#each userAnswers}}
  - **Answer for Question {{#if @index}}{{@index}}{{else}}0{{/if}}:** {{this}}
  {{/each}}

  **Your Evaluation Task:**
  1.  **Provide Overall Feedback:** Write a brief, encouraging summary of the user's performance. Mention their strengths and general areas for improvement.
  2.  **Provide Individual Feedback:** Create a feedback list. For each question:
      - Determine if the user's answer is 'correct', 'incorrect', or 'partially-correct'.
      - For 'partially-correct' answers, you MUST decide on the partial marks to award and include it in the 'marksAwarded' field. The awarded marks cannot exceed the total marks for the question.
      - For 'correct' answers, you do not need to set 'marksAwarded', as full marks will be given automatically.
      - For 'incorrect' answers, 'marksAwarded' should be 0.
      - Provide a brief, clear explanation of why the answer is correct, incorrect, or partially correct.
      - Include the original user answer for that question in the 'userAnswer' field.
  3.  **Do NOT Calculate Total Score or Grade:** You do not need to calculate the final score or grade. Just provide the feedback for each question. The total score will be calculated programmatically based on your per-question evaluation.

  Please provide the output in a single JSON object.
  `,
});

const evaluateExamFlow = ai.defineFlow(
  {
    name: 'evaluateExamFlow',
    inputSchema: EvaluateExamInputSchema,
    outputSchema: EvaluateExamOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to evaluate the exam.');
    }

    let calculatedScore = 0;
    const totalMarks = input.examQuestions.reduce((acc, q) => acc + q.marks, 0);

    const feedbackWithAnswers = output.feedbackPerQuestion.map((feedback, index) => {
      const question = input.examQuestions[index];
      let awarded = 0;
      if (feedback.isCorrect === 'correct') {
        awarded = question.marks;
      } else if (feedback.isCorrect === 'partially-correct' && feedback.marksAwarded) {
        awarded = Math.min(feedback.marksAwarded, question.marks); // Cap at max marks
      }
      calculatedScore += awarded;
      
      return {
        ...feedback,
        userAnswer: input.userAnswers[index] || '',
        marksAwarded: awarded, // Store the final calculated marks
      };
    });
    
    const grade = getGrade(calculatedScore, totalMarks);

    return { 
        ...output, 
        totalScore: calculatedScore,
        feedbackPerQuestion: feedbackWithAnswers,
        grade,
    };
  }
);
