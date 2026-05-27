import { z } from 'zod';

export const RepoContextSchema = z.object({
  repoUrl: z.string(),
  baseBranch: z.string(),
  repoName: z.string().optional(),
});
export type RepoContext = z.infer<typeof RepoContextSchema>;

export const CodeDiffSchema = z.object({
  prUrl: z.string(),
  branchName: z.string(),
  filesChanged: z.array(z.string()),
  commitMessage: z.string(),
});
export type CodeDiff = z.infer<typeof CodeDiffSchema>;
