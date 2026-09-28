import * as s3Service from "../services/s3.service.js";

export async function uploadFile(req, res) {
    try {
        const key = `${Date.now()}-${req.file.originalname}`;
        await s3Service.uploadFile(req.file.buffer, key, req.file.mimetype);
        res.status(201).json({ key });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Upload failed" });
    }
}

// export async function downloadFile(req, res) {
//   - get the S3 object as a readable stream (not buffered!)
//   - set appropriate response headers (Content-Type, Content-Disposition)
//   - pipe the S3 stream directly into res
// }

// export async function listFiles(req, res) {
//   - optional: list objects in the bucket, or query your own DB if you
//     decide to track uploads there
// }