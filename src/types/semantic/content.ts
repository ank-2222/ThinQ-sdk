import { z } from 'zod';

export const TrendReportSchema = z.object({
  trends: z.array(
    z.object({
      topic: z.string(),
      platform: z.string(),
      score: z.number().optional(),
    })
  ),
});
export type TrendReport = z.infer<typeof TrendReportSchema>;

export const IdeaSchema = z.object({
  id: z.string(),
  title: z.string(),
  hook: z.string(),
  platform: z.string(),
});
export type Idea = z.infer<typeof IdeaSchema>;

export const IdeaListSchema = z.object({
  ideas: z.array(IdeaSchema),
});
export type IdeaList = z.infer<typeof IdeaListSchema>;

export const ScriptSchema = z.object({
  ideaId: z.string().optional(),
  hook: z.string(),
  body: z.string(),
  cta: z.string(),
  hashtags: z.array(z.string()).optional(),
  platform: z.string(),
});
export type Script = z.infer<typeof ScriptSchema>;

export const MultiPlatformPackSchema = z.object({
  original: ScriptSchema,
  adaptations: z.array(
    z.object({
      platform: z.string(),
      content: z.string(),
      format: z.string(),
    })
  ),
});
export type MultiPlatformPack = z.infer<typeof MultiPlatformPackSchema>;
