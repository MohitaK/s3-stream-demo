// Shared BullMQ connection config, used by both the producer (queue.js,
// called from your API process) and the worker (worker.js, a separate
// process that actually does the work).
//
// TODO (you):
// - export a `connection` object ({ host, port }) built from config.redis
// - export the queue name(s) as a constant so producer/worker agree on it
