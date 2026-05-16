import { Router, Request, Response } from 'express';

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
  handler: (task: Task, stream: Stream) => Promise<void>;
}

export interface ThinQAdapter {
  router: Router;
}

export function createThinQAdapter({
  name,
  capabilities = [],
  secret,
  credentials = {},
  handler,
}: ThinQAdapterOptions): ThinQAdapter {
  if (!name) throw new Error('name is required');
  if (!secret) throw new Error('secret is required');
  if (typeof handler !== 'function') throw new Error('handler must be a function');

  const router = Router();

  router.get('/info', (_req: Request, res: Response) => {
    res.json({ name, capabilities });
  });

  router.post('/run', async (req: Request, res: Response) => {
    // Verify the request came from the ThinQ platform
    if (req.headers['x-thinq-secret'] !== secret) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const stream: Stream = {
      send(type: string, content: unknown) {
        res.write(`event: ${type}\ndata: ${JSON.stringify(content)}\n\n`);
      },
      end() {
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
