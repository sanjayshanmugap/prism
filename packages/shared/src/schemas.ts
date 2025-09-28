import { z } from 'zod';

export const CitationSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  publisher: z.string().optional(),
  publishedAt: z.string().optional(),
});

export const BriefSchema = z.object({
  id: z.string().uuid(),
  query: z.string().min(1),
  context: z.object({
    url: z.string().url().optional(),
    title: z.string().optional(),
    timestampSec: z.number().optional(),
  }).optional(),
  title: z.string().min(1),
  summary: z.string().min(1),
  bullets: z.array(z.string()).min(1),
  citations: z.array(CitationSchema).min(1),
  createdAt: z.string().datetime(),
});

export const AskRequestSchema = z.object({
  query: z.string().min(1),
  mode: z.enum(['article', 'video', 'highlight']),
  selectionText: z.string().optional(),
  context: z.object({
    url: z.string().url().optional(),
    title: z.string().optional(),
    timestampSec: z.number().optional(),
  }).optional(),
});

export const AskResponseSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    brief: BriefSchema,
  }),
  z.object({
    ok: z.literal(false),
    error: z.string(),
  }),
]);

// Validation utilities
export const validateBrief = (data: unknown) => {
  return BriefSchema.safeParse(data);
};

export const validateAskRequest = (data: unknown) => {
  return AskRequestSchema.safeParse(data);
};

export const validateAskResponse = (data: unknown) => {
  return AskResponseSchema.safeParse(data);
};