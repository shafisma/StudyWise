/**
 * @fileOverview Schemas and types for exam generation.
 */
import { z } from 'zod';

export const ExamQuestionSchema = z.object({
  question_type: z.enum(['mcq', 'short_answer', 'descriptive']),
  question_text: z.string().describe('The full text of the question.'),
  options: z.array(z.string()).optional().describe('An array of 4 multiple-choice options. Required only for MCQ type.'),
  correct_answer: z.string().describe('The correct answer for the question. For MCQ, it must be one of the options.'),
  marks: z.number().int().min(1).describe('The marks allocated to this question.'),
});
export type ExamQuestion = z.infer<typeof ExamQuestionSchema>;

export const GenerateExamInputSchema = z.object({
  subject: z.string().describe('The subject of the exam (e.g., "Biology").'),
  chapters: z.string().describe('The specific chapters or topics to be covered (e.g., "5, 6, 7" or "Cell Structure, Photosynthesis").'),
  grade: z.string().describe('The academic grade or level for which the exam is intended (e.g., "High School", "University Level", "10th Grade").'),
  totalMarks: z.number().int().min(1).describe('The total marks for the entire exam.'),
  questionTypes: z.array(z.enum(['mcq', 'short_answer', 'descriptive'])).describe('An array of question types to include in the exam.'),
});
export type GenerateExamInput = z.infer<typeof GenerateExamInputSchema>;

export const GenerateExamOutputSchema = z.object({
  title: z.string().describe('A suitable title for the exam paper.'),
  timeLimitMinutes: z.number().int().min(1).describe('The suggested time limit for the exam in minutes.'),
  instructions: z.string().describe('General instructions for the exam.'),
  questions: z.array(ExamQuestionSchema).describe('An array of exam questions.'),
});
export type GenerateExamOutput = z.infer<typeof GenerateExamOutputSchema>;
