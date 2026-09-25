// Controllers translate HTTP req/res into calls on your services.
// Keep them thin — the S3 and queue logic belongs in services/, not here.

// TODO (you): implement once s3.service.js and queue.service.js exist.
//
// export async function uploadFile(req, res) {
//   - req.file (from multer) has the uploaded file's buffer/stream + metadata
//   - call an s3.service function to upload it
//   - after a successful upload, enqueue a background job
//     (e.g. "generate a thumbnail", "scan the file", "extract metadata")
//   - respond with the S3 key / object info
// }

// export async function downloadFile(req, res) {
//   - get the S3 object as a readable stream (not buffered!)
//   - set appropriate response headers (Content-Type, Content-Disposition)
//   - pipe the S3 stream directly into res
// }

// export async function listFiles(req, res) {
//   - optional: list objects in the bucket, or query your own DB if you
//     decide to track uploads there
// }
