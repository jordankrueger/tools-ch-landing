import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const tasks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tasks' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    target_route: z.string(),
    target_label: z.string(),
    related_tools: z.array(z.string()),
  }),
});

export const collections = { tasks };
