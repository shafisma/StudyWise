'use server';

import { z } from 'genkit';
import { ai } from '@/ai/genkit';

export const ConceptMapInputSchema = z.object({
  topic: z.string(),
  additionalDetails: z.string().optional(),
});
export type ConceptMapInput = z.infer<typeof ConceptMapInputSchema>;

export const ConceptMapNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
});

export const ConceptMapRelationshipSchema = z.object({
  source: z.string(),
  target: z.string(),
  relation: z.string(),
});

export const ConceptMapOutputSchema = z.object({
  concepts: z.array(ConceptMapNodeSchema),
  relationships: z.array(ConceptMapRelationshipSchema),
});
export type ConceptMapOutput = z.infer<typeof ConceptMapOutputSchema>;

const generateConceptMapPrompt = ai.definePrompt({
    name: 'generateConceptMap',
    input: { schema: ConceptMapInputSchema },
    output: { schema: ConceptMapOutputSchema },
    config: {
        temperature: 0.5,
    },
    prompt: `Generate a concept map for the topic: {{topic}}. 
    {{#if additionalDetails}}Additional context: {{additionalDetails}}{{/if}}
    
    Identify key concepts and how they are related. 
    Create a list of nodes (concepts) and edges (relationships).
    Ensure the IDs are unique simple strings (e.g. "c1", "c2").`
});

export const generateConceptMap = ai.defineFlow({
    name: 'generateConceptMapFlow',
    inputSchema: ConceptMapInputSchema,
    outputSchema: ConceptMapOutputSchema,
}, async (input) => {
    const result = await generateConceptMapPrompt(input);
    if (!result.output) {
        throw new Error('Failed to generate concept map');
    }
    return result.output;
});
