# thinq-agent-sdk

Register your app as a ThinQ agent with one function call.

## Install

```bash
npm install thinq-agent-sdk express
```

## Usage

```js
const express = require('express');
const { createThinQAdapter } = require('thinq-agent-sdk');

const app = express();
app.use(express.json());

const { router } = createThinQAdapter({
  name: 'My Agent',
  capabilities: ['summarize', 'translate'],
  secret: process.env.THINQ_SECRET,

  async handler(task, stream) {
    stream.send('message', `Processing: ${task.input}`);
    // ... your logic here
    stream.end();
  },
});

app.use('/agent', router);
app.listen(3000);
```

## Routes

| Method | Path         | Description                        |
|--------|--------------|------------------------------------|
| GET    | `/info`      | Returns `{ name, capabilities }`   |
| POST   | `/run`       | Streams SSE response of task output |

**Auth:** include `x-thinq-secret: <secret>` on every `/run` request. Returns `401` on mismatch.

## SSE events

| Event     | Payload            |
|-----------|--------------------|
| `message` | any string/object  |
| `error`   | error message      |
| `done`    | `{}` (stream end)  |

## `handler(task, stream)`

- `task.input` — the input string from the POST body
- `task.context` — optional context object
- `stream.send(type, content)` — emit an SSE event
- `stream.end()` — close the stream
