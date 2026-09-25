// This is where all direct interaction with S3 (or MinIO, which speaks
// the same S3 API) lives. Keep AWS SDK specifics out of your controllers.
//
// Useful pieces from @aws-sdk/client-s3 and @aws-sdk/lib-storage you'll
// likely want to look up:
//   - new S3Client({ endpoint, region, credentials, forcePathStyle })
//   - PutObjectCommand            (simple, whole-buffer upload)
//   - Upload (from lib-storage)   (multipart upload, better for streams/large files)
//   - GetObjectCommand            (returns a Body that's a readable stream)
//   - DeleteObjectCommand
//   - getSignedUrl (from @aws-sdk/s3-request-presigner, for pre-signed URLs)
//
// TODO (you):
// - create and export an S3Client instance configured from config.s3
// - export an uploadFile(fileStreamOrBuffer, key) function
// - export a getFileStream(key) function that returns a readable stream
//   (this is the piece that lets the controller stream the download
//   instead of loading the whole file into memory)
