import { z } from 'zod';

export const IssueSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  labels: z.array(z.string()).default([]),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});
export type Issue = z.infer<typeof IssueSchema>;

export const IssueListSchema = z.object({
  issues: z.array(IssueSchema),
});
export type IssueList = z.infer<typeof IssueListSchema>;

export const IssueRefsSchema = z.object({
  issues: z.array(
    z.object({
      id: z.string(),
      githubIssueNumber: z.number(),
      branchName: z.string(),
    })
  ),
});
export type IssueRefs = z.infer<typeof IssueRefsSchema>;
