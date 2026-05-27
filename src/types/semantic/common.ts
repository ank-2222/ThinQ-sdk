import { z } from 'zod';

export const QuerySchema = z.object({
  query: z.string(),
  context: z.string().optional(),
});
export type Query = z.infer<typeof QuerySchema>;
