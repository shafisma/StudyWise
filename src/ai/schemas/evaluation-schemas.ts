/**
 * @fileOverview Schemas and types for exam evaluation.
 */
import { z } from 'zod';
import { ExamQuestionSchema } from './exam-schemas';

export const EvaluateExamInputSchema = z.object({
  examQuestions: z.array(ExamQuestionSchema).describe("The original list of questions from the generated exam."),
  userAnswers: z.array(z.string()).describe("The list of answers submitted by the user, in the same order as the questions."),
});
export type EvaluateExamInput = z.infer<typeof EvaluateExamInputSchema>;


export const QuestionFeedbackSchema = z.object({
    isCorrect: z.enum(['correct', 'incorrect', 'partially-correct']).describe("Whether the user's answer was correct, incorrect, or partially correct."),
    feedback: z.string().describe("A brief explanation for why the answer was incorrect/partially-correct, or a confirmation for a correct answer."),
    userAnswer: z.string().describe("The original answer submitted by the user for this question."),
    marksAwarded: z.number().int().optional().describe("For partially correct answers, the marks awarded by the AI. Not needed for fully correct or incorrect answers.")
});
export type QuestionFeedback = z.infer<typeof QuestionFeedbackSchema>;


export const EvaluateExamOutputSchema = z.object({
  totalScore: z.number().int().describe("The total score the user achieved, calculated programmatically."),
  overallFeedback: z.string().describe("A brief summary of the user's performance."),
  feedbackPerQuestion: z.array(QuestionFeedbackSchema).describe("An array of feedback objects, one for each question, in order."),
});
export type EvaluateExamOutput = z.infer<typeof EvaluateExamOutputSchema>;
