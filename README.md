# thinq-agent-sdk

Register your app as a ThinQ agent with one function call.

## Install

```bash
npm install thinq-agent-sdk express
```

## Usage

```ts
import express from 'express';
import { createThinQAdapter } from 'thinq-agent-sdk';

const app = express();
app.use(express.json());

const { router } = createThinQAdapter({
  name: 'My Agent',
  capabilities: ['summarize', 'translate'],
  secret: process.env.THINQ_SECRET!,

  async handler(task, stream) {
    stream.send('message', `Processing: ${task.input}`);
    // ... your logic here
    stream.end();
  },
});

app.use('/agent', router);
app.listen(3000);
```

## Typed agents with schema validation

```ts
import {
  createThinQAdapter,
  createEnvelope,
  QuerySchema,
  IssueListSchema,
  type IssueList,
} from 'thinq-agent-sdk';

const { router } = createThinQAdapter({
  name: 'PM Agent',
  agentId: 'pm-agent',
  secret: process.env.THINQ_SECRET!,
  accepts: ['Query'],
  produces: ['IssueList'],
  inputSchema: QuerySchema,   // validated before handler is called (400 on failure)
  outputSchema: IssueListSchema, // validated against envelope payload on stream.end()
  async handler(task, stream) {
    const issues: IssueList = { issues: [] };

    stream.send('message', 'Breaking down task into issues...');

    const envelope = createEnvelope('pm-agent', 'IssueList', issues);
    stream.send('result', envelope);
    stream.end();
  },
});
```

## Routes

| Method | Path    | Description                                                        |
|--------|---------|--------------------------------------------------------------------|
| GET    | `/info` | Returns agent metadata (name, agentId, capabilities, schemas, ...) |
| POST   | `/run`  | Streams SSE response of task output                                |

**Auth:** include `x-thinq-secret: <secret>` on every `/run` request. Returns `401` on mismatch.

## `ThinQAdapterOptions`

| Field          | Type                  | Required | Description                                              |
|----------------|-----------------------|----------|----------------------------------------------------------|
| `name`         | `string`              | yes      | Human-readable agent name                               |
| `secret`       | `string`              | yes      | ThinQ platform secret; verified on every `/run` request |
| `handler`      | `function`            | yes      | Async function called with `(task, stream)`             |
| `agentId`      | `string`              | no       | Unique ID (defaults to slugified `name`)                |
| `capabilities` | `string[]`            | no       | Legacy capability tags                                  |
| `accepts`      | `string[]`            | no       | Semantic input types this agent accepts                 |
| `produces`     | `string[]`            | no       | Semantic output types this agent produces               |
| `inputSchema`  | `ZodType`             | no       | Zod schema; request body validated before handler runs  |
| `outputSchema` | `ZodType`             | no       | Zod schema; envelope payload validated on `stream.end()`|
| `credentials`  | `Record<string,string>` | no     | Injected into `task.context`; never sent over the wire  |

## SSE events

| Event     | Payload                        |
|-----------|--------------------------------|
| `message` | any string/object              |
| `result`  | `OutputEnvelope`               |
| `error`   | error message or validation errors |
| `done`    | `{}` (stream end)              |

## `createEnvelope(agentId, type, payload, metadata?)`

Helper to build a typed `OutputEnvelope`:

```ts
const envelope = createEnvelope('my-agent', 'IssueList', payload);
// { type, schemaVersion, payload, metadata: { agentId, timestamp } }
```

## Built-in semantic types

Importable Zod schemas and TypeScript types for common agent I/O:

| Export                | Description                        |
|-----------------------|------------------------------------|
| `QuerySchema`         | `{ query, context? }`              |
| `ResearchReportSchema`| Research findings with confidence  |
| `IssueSchema`         | Single GitHub-style issue          |
| `IssueListSchema`     | Array of issues                    |
| `IssueRefsSchema`     | Issues with PR branch refs         |
| `RepoContextSchema`   | Repo URL + base branch             |
| `CodeDiffSchema`      | PR URL + changed files             |
| `TrendReportSchema`   | Social trend data                  |
| `IdeaSchema`          | Content idea with platform         |
| `IdeaListSchema`      | Array of ideas                     |
| `ScriptSchema`        | Content script (hook/body/cta)     |
| `MultiPlatformPackSchema` | Script adapted for multiple platforms |
