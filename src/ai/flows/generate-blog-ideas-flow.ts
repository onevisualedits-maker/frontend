'use server';
/**
 * @fileOverview A Genkit flow for generating blog post ideas based on keywords or industry trends.
 *
 * - generateBlogIdeas - A function that handles the blog idea generation process.
 * - GenerateBlogIdeasInput - The input type for the generateBlogIdeas function.
 * - GenerateBlogIdeasOutput - The return type for the generateBlogIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBlogIdeasInputSchema = z.object({
  keywords: z
    .string()
    .describe('Keywords or industry trends to base blog post ideas on.'),
});
export type GenerateBlogIdeasInput = z.infer<typeof GenerateBlogIdeasInputSchema>;

const GenerateBlogIdeasOutputSchema = z.object({
  blogIdeas: z.array(z.string()).describe('A list of blog post ideas.'),
});
export type GenerateBlogIdeasOutput = z.infer<typeof GenerateBlogIdeasOutputSchema>;

export async function generateBlogIdeas(input: GenerateBlogIdeasInput): Promise<GenerateBlogIdeasOutput> {
  return generateBlogIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBlogIdeasPrompt',
  input: {schema: GenerateBlogIdeasInputSchema},
  output: {schema: GenerateBlogIdeasOutputSchema},
  prompt: `You are an AI assistant specialized in generating creative and relevant blog post ideas for a professional video editor named 'JeevanEditz'.

Based on the following keywords or industry trends, generate a list of 5-10 compelling blog post ideas that would appeal to an audience interested in video editing, filmmaking, or creative content creation.

Keywords/Trends: {{{keywords}}}`,
});

const generateBlogIdeasFlow = ai.defineFlow(
  {
    name: 'generateBlogIdeasFlow',
    inputSchema: GenerateBlogIdeasInputSchema,
    outputSchema: GenerateBlogIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
