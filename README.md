# s3-stream-demo

A learning project: upload a file from a React UI, store it in S3
(MinIO locally), stream it back on download, and process it in the
background through a queue.

This repo is **scaffolded, not implemented**. Folders, dependencies,
and stub files with `TODO` comments are in place — the actual logic
is intentionally left for you to write.

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

Every `TODO` stub has comments describing what it needs to do and
which library pieces (specific AWS SDK v3 classes, BullMQ classes) to
look up — the goal is to leave the "why" and pointers without writing
the implementation for you.

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

## Pushing to GitHub

This repo has been `git init`'d locally with an initial commit. To push it:

1. Create a new **empty** repo on GitHub (no README/gitignore/license — this repo already has those) — e.g. `s3-stream-demo`.
2. Then run:
   ```
   git remote add origin git@github.com:<your-username>/s3-stream-demo.git
   git branch -M main
   git push -u origin main
   ```
