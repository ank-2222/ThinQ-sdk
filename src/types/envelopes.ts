import { z } from 'zod';

export const OutputEnvelopeSchema = z.object({
  type: z.string(),
  schemaVersion: z.string().default('1.0'),
  payload: z.unknown(),
  metadata: z.object({
    agentId: z.string(),
    timestamp: z.string(),
    confidence: z.number().optional(),
  }),
});

export type OutputEnvelope = z.infer<typeof OutputEnvelopeSchema>;
