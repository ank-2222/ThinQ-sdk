import express from 'express';
import { createThinQAdapter, Task, Stream } from '../src/index';

const app = express();
app.use(express.json());

const { router } = createThinQAdapter({
  name: 'Echo Agent',
  capabilities: ['echo', 'reverse'],

  // Issued by ThinQ — only requests carrying this header are accepted
  secret: process.env.THINQ_SECRET!,

  // Developer's own API keys — injected into task.context, never sent over the wire
  credentials: {
    openaiKey: process.env.OPENAI_API_KEY!,
  },

  async handler(task: Task, stream: Stream) {
    const input = task.input ?? '';
    // task.context.openaiKey is available here — use it to call external APIs
    stream.send('message', `Echo: ${input}`);
    stream.send('message', `Reversed: ${input.split('').reverse().join('')}`);
    stream.end();
  },
});

app.use('/agent', router);

app.listen(3000, () => {
  console.log('Echo agent running on http://localhost:3000');
  console.log('  GET  http://localhost:3000/agent/info');
  console.log('  POST http://localhost:3000/agent/run  (x-thinq-secret: <THINQ_SECRET>)');
});
