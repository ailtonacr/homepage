import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    eyebrow: z.string(),
    summary: z.string(),
    description: z.string(),
    order: z.number(),
    featured: z.boolean().default(false),
    category: z.enum(["produto", "infraestrutura", "automacao", "experimento"]),
    status: z.enum(["em-evolucao", "experimental", "em-desenvolvimento"]),
    tags: z.array(z.string()).min(1),
    visual: z.enum(["pastemax", "account", "meushape", "crypbot", "tavalendo", "delivery"]),
    highlights: z.array(z.object({ label: z.string(), description: z.string() })).default([]),
    website: z.string().url().optional(),
    repository: z.string().url().optional(),
  }),
});

export const collections = { projects };
