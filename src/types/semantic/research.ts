import { z } from 'zod';

export const ResearchReportSchema = z.object({
  summary: z.string(),
  findings: z.array(z.string()),
  sources: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1).optional(),
});
export type ResearchReport = z.infer<typeof ResearchReportSchema>;
