# s3-stream-demo

A learning project: upload a file from a React UI, store it in S3
(MinIO locally), stream it back on download, and process it in the
background through a queue.

## Stack

- **Client**: React (Vite)
- **Server**: Node.js + Express
- **Storage**: S3-compatible — MinIO locally, swappable for real AWS S3 later (same API, just different env vars)
- **Queue**: BullMQ + Redis

## Why these pieces

- **MinIO** speaks the real S3 API, so everything you write against it
  (`@aws-sdk/client-s3`) works unchanged against real AWS S3 later —
  you just change `S3_ENDPOINT` and credentials in `.env`.
- **BullMQ** is the standard Node.js job queue, built on Redis. It's
  what lets the upload request return quickly while heavier work
  (processing the file) happens separately, in a worker process.
- **Streaming** matters here because both the S3 SDK's `GetObjectCommand`
  response and Node's HTTP `res` object are streams — piping one into
  the other means the server never has to hold a whole file in memory
  to serve a download.

## Project layout

```
s3-stream-demo/
├── docker-compose.yml       # local MinIO + Redis
├── .env.example             # copy to server/.env
├── server/
│   └── src/
│       ├── index.js         # Express app entrypoint (already wired up)
│       ├── config/env.js    # env var loading (done)
│       ├── routes/          # TODO: route definitions
│       ├── controllers/     # TODO: request handlers
│       ├── services/        # TODO: S3 + queue logic
│       ├── queue/           # TODO: BullMQ producer + worker
│       └── middleware/      # TODO: multer upload config
└── client/                  # Vite React app (default template)
    └── src/
        ├── api/client.js         # TODO: fetch wrapper for the API
        └── components/UploadForm.jsx  # TODO: upload UI
```

## Getting started

1. **Local services** (needs [Docker Desktop](https://www.docker.com/products/docker-desktop/)):
   ```
   docker compose up -d
   ```
   This gives you MinIO (S3 API on :9000, console on :9001) and Redis (:6379).
   If you'd rather not use Docker, you can install MinIO and Redis natively — just
   make sure the ports/credentials line up with `.env.example`, or update it.

2. **Server**:
   ```
   cd server
   cp ../.env.example .env
   npm run dev
   ```
   Visit `http://localhost:4000/health` — should return `{"status":"ok"}`.
   That's the whole skeleton confirming it runs before you add real logic.

3. **Client**:
   ```
   cd client
   npm run dev
   ```

4. **Worker** (once you've implemented it):
   ```
   cd server
   npm run worker
   ```

5. **Create your MinIO bucket** the first time: open the console at
   `http://localhost:9001`, log in with `minioadmin` / `minioadmin`,
   and create a bucket named `uploads-demo` (matches `S3_BUCKET` in
   `.env.example`).

## Suggested build order

Roughly the order that keeps each step testable before moving on:

- [ ] Implement `s3.service.js`: connect to MinIO, write `uploadFile()`
- [ ] Implement `upload.middleware.js` + the `/upload` route + controller — get a file from the React form into MinIO
- [ ] Build the React `UploadForm` to hit that endpoint
- [ ] Implement `getFileStream()` in `s3.service.js` + the `/download` route — stream a file back out
- [ ] Add a download button/link in the UI
- [ ] Implement `queue.service.js` + `producer.js` — enqueue a job after upload
- [ ] Implement `worker.js` — consume the job, read the file back via a stream, do something with it (log its size, count lines, whatever you want to practice with)
- [ ] (Optional) swap MinIO for real AWS S3 and confirm nothing but `.env` changed

## Ideas to build on later

Things that came up while building the basics — deliberately skipped for
now to keep the core flow (upload → store → stream → queue) simple, but
worth coming back to:

- **`fileFilter` on multer** — reject file types you don't want (e.g. only
  allow images) before they ever reach a controller. Useful validation
  practice; skipped because you're uploading your own test files.

- **Streaming uploads instead of buffering** — swap `multer.memoryStorage()`
  for a streaming approach (`Upload` from `@aws-sdk/lib-storage`, fed by
  the incoming request stream) so large files never sit fully in server
  RAM. Buffering is fine at small file sizes; streaming is what real
  production upload paths use.

- **Disk storage vs memory storage (multer)** — `multer.diskStorage()`
  writes the incoming file to a temp file on the server's disk instead of
  holding it in RAM, which is friendlier for larger files but adds a step
  (read the temp file, then upload it, then clean it up). Memory storage
  is simpler and was the right call to start with.

- **Pre-signed URLs** — instead of routing file bytes through Express at
  all, generate a short-lived signed URL (`getSignedUrl` from
  `@aws-sdk/s3-request-presigner`, already installed) and have the
  browser upload *directly* to S3/MinIO. Removes the server as a
  bottleneck/timeout risk for large or slow uploads entirely — this is
  how most production apps actually do it.

- **`fileSize` limit on multer** — currently unbounded; add
  `limits: { fileSize: ... }` to `upload.middleware.js` and handle the
  resulting error cleanly (multer throws before reaching the controller).