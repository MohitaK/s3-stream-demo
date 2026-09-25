import { Router } from "express";
import Busboy from "busboy";
import { randomUUID } from "node:crypto";
import {
  ListObjectsV2Command,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { config } from "../config.js";
import { s3 } from "../s3Client.js";
import { fileQueue } from "../queue/queue.js";

export const filesRouter = Router();

/**
 * POST /files/upload
 *
 * Streams the incoming multipart file straight through to S3 instead of
 * buffering it on disk or in memory first:
 *
 *   client --(chunks)--> busboy --(chunks)--> @aws-sdk/lib-storage Upload --(multipart PUT)--> S3
 *
 * `Upload` from @aws-sdk/lib-storage reads the stream as it arrives and
 * issues S3 multipart-upload requests part by part, so memory use stays
 * flat no matter how large the file is.
 */
filesRouter.post("/upload", (req, res) => {
  const busboy = Busboy({ headers: req.headers, limits: { files: 1 } });

  let uploadStarted = false;

  busboy.on("file", (_fieldname, fileStream, info) => {
    uploadStarted = true;
    const { filename, mimeType } = info;
    const key = `${randomUUID()}-${filename}`;

    const upload = new Upload({
      client: s3,
      params: {
        Bucket: config.s3.bucket,
        Key: key,
        Body: fileStream, // <-- the readable stream, not a buffer
        ContentType: mimeType,
        Metadata: { originalname: encodeURIComponent(filename) },
      },
      queueSize: 4, // parallel S3 parts in flight
      partSize: 5 * 1024 * 1024, // 5MB, S3's minimum part size
    });

    upload
      .done()
      .then(async () => {
        // Enqueue background processing now that the object exists in S3.
        const job = await fileQueue.add("process", {
          key,
          originalName: filename,
        });

        res.status(201).json({
          key,
          originalName: filename,
          contentType: mimeType,
          jobId: job.id,
        });
      })
      .catch((err) => {
        console.error("[upload] failed:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Upload failed" });
        }
      });
  });

  busboy.on("finish", () => {
    if (!uploadStarted) {
      res.status(400).json({ error: "No file field found in request" });
    }
  });

  req.pipe(busboy);
});

/**
 * GET /files
 * Lists objects in the bucket. Fine to buffer here — it's metadata, not
 * file contents — S3 returns at most 1000 keys per call.
 */
filesRouter.get("/", async (_req, res) => {
  try {
    const result = await s3.send(
      new ListObjectsV2Command({ Bucket: config.s3.bucket })
    );

    const items = (result.Contents ?? [])
      .sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified))
      .map((obj) => ({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified,
      }));

    res.json(items);
  } catch (err) {
    console.error("[list] failed:", err);
    res.status(500).json({ error: "Could not list files" });
  }
});

/**
 * GET /files/download/:key
 *
 * Streams the object straight from S3 to the HTTP response:
 *
 *   S3 --(chunks)--> GetObjectCommand Body stream --(chunks)--> res
 *
 * The file is never fully read into memory on the server — bytes are
 * forwarded to the client as they arrive from S3.
 */
filesRouter.get("/download/:key", async (req, res) => {
  const { key } = req.params;

  try {
    const object = await s3.send(
      new GetObjectCommand({ Bucket: config.s3.bucket, Key: key })
    );

    const originalName = decodeURIComponent(
      object.Metadata?.originalname ?? key
    );

    res.setHeader(
      "Content-Type",
      object.ContentType ?? "application/octet-stream"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${originalName}"`
    );
    if (object.ContentLength) {
      res.setHeader("Content-Length", object.ContentLength);
    }

    // object.Body is a Node.js Readable in this runtime — pipe it directly.
    object.Body.pipe(res);
    object.Body.on("error", (err) => {
      console.error("[download] stream error:", err);
      res.destroy(err);
    });
  } catch (err) {
    if (err.name === "NoSuchKey") {
      return res.status(404).json({ error: "File not found" });
    }
    console.error("[download] failed:", err);
    res.status(500).json({ error: "Download failed" });
  }
});

filesRouter.delete("/:key", async (req, res) => {
  try {
    await s3.send(
      new DeleteObjectCommand({ Bucket: config.s3.bucket, Key: req.params.key })
    );
    res.status(204).end();
  } catch (err) {
    console.error("[delete] failed:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});
