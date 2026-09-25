import { Queue, QueueEvents } from "bullmq";
import IORedis from "ioredis";
import { config } from "../config.js";

// BullMQ needs `maxRetriesPerRequest: null` on the ioredis connection it's
// given, otherwise ioredis's own retry logic fights with BullMQ's blocking
// commands. One connection is reused by the Queue and QueueEvents below.
export const connection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null,
});

export const QUEUE_NAME = "file-processing";

// The producer side: the Express route pushes a job here after an upload
// finishes. It never runs the work itself — a separate worker process does
// (see worker.js) — so a slow or crashing job can't take the API down.
export const fileQueue = new Queue(QUEUE_NAME, { connection });

// Lets the API subscribe to job progress/completion events (used by the
// GET /jobs/:id endpoint) without polling Redis directly.
export const queueEvents = new QueueEvents(QUEUE_NAME, { connection });
