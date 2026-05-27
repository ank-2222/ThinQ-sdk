import { Router, Request, Response } from 'express';
import type { ZodType } from 'zod';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { zodToJsonSchema } = require('zod-to-json-schema') as { zodToJsonSchema: (schema: unknown) => unknown };
import { OutputEnvelope } from './types/envelopes';

export interface Stream {
  send(type: string, content: unknown): void;
  end(): void;
}

export interface Task {
  input?: string;
  context?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ThinQAdapterOptions {
  name: string;
  capabilities?: string[];
  /** Secret issued by ThinQ platform. Every inbound /run request must carry this in x-thinq-secret. */
  secret: string;
  /**
   * Developer-supplied API keys or config (e.g. { openaiKey: process.env.OPENAI_KEY }).
   * Merged into task.context before handler is called — never exposed over the wire.
   */
  credentials?: Record<string, string>;
  agentId?: string;
  accepts?: string[];
  produces?: string[];
  inputSchema?: ZodType;
  outputSchema?: ZodType;
  handler: (task: Task, stream: Stream) => Promise<void>;
}

export interface ThinQAdapter {
  router: Router;
}

export function createEnvelope(
  agentId: string,
  type: string,
  payload: unknown,
  metadata?: Partial<OutputEnvelope['metadata']>
): OutputEnvelope {
  return {
    type,
    schemaVersion: '1.0',
    payload,
    metadata: {
      agentId,
      timestamp: new Date().toISOString(),
      ...metadata,
    },
  };
}

export function createThinQAdapter({
  name,
  capabilities = [],
  secret,
  credentials = {},
  agentId,
  accepts = [],
  produces = [],
  inputSchema,
  outputSchema,
  handler,
}: ThinQAdapterOptions): ThinQAdapter {
  if (!name) throw new Error('name is required');
  if (!secret) throw new Error('secret is required');
  if (typeof handler !== 'function') throw new Error('handler must be a function');

  const resolvedAgentId = agentId ?? name.toLowerCase().replace(/\s+/g, '-');
  const router = Router();

  router.get('/info', (_req: Request, res: Response) => {
    res.json({
      name,
      agentId: resolvedAgentId,
      capabilities,
      accepts,
      produces,
      inputSchema: inputSchema ? zodToJsonSchema(inputSchema) : null,
      outputSchema: outputSchema ? zodToJsonSchema(outputSchema) : null,
    });
  });

  router.post('/run', async (req: Request, res: Response) => {
    if (req.headers['x-thinq-secret'] !== secret) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (inputSchema) {
      const result = inputSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ error: 'Invalid input', details: result.error.issues });
        return;
      }
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let lastEnvelopePayload: unknown = undefined;
    let envelopeCaptured = false;

    const stream: Stream = {
      send(type: string, content: unknown) {
        if (outputSchema && type === 'result') {
          const envelope = content as OutputEnvelope;
          lastEnvelopePayload = envelope?.payload;
          envelopeCaptured = true;
        }
        res.write(`event: ${type}\ndata: ${JSON.stringify(content)}\n\n`);
      },
      end() {
        if (outputSchema && envelopeCaptured) {
          const validation = outputSchema.safeParse(lastEnvelopePayload);
          if (!validation.success) {
            res.write(
              `event: error\ndata: ${JSON.stringify({
                error: 'Output validation failed',
                details: validation.error.issues,
              })}\n\n`
            );
            res.end();
            return;
          }
        }
        res.write('event: done\ndata: {}\n\n');
        res.end();
      },
    };

    // Inject developer credentials into context — not sourced from the request body
    const task: Task = {
      ...(req.body ?? {}),
      context: {
        ...(req.body?.context ?? {}),
        ...credentials,
      },
    };

    try {
      await handler(task, stream);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal error';
      stream.send('error', message);
      stream.end();
    }
  });

  return { router };
}
