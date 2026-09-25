import { Router } from "express";
import { fileQueue } from "../queue/queue.js";

export const jobsRouter = Router();

/**
 * GET /jobs/:id
 * Lets the frontend poll for the status of a background processing job
 * that was created when a file finished uploading.
 */
jobsRouter.get("/:id", async (req, res) => {
  const job = await fileQueue.getJob(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  const state = await job.getState();
  res.json({
    id: job.id,
    state, // 'waiting' | 'active' | 'completed' | 'failed' | ...
    progress: job.progress ?? 0,
    result: state === "completed" ? job.returnvalue : null,
    failedReason: state === "failed" ? job.failedReason : null,
  });
});
