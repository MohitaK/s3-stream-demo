// This is where all direct interaction with S3 (or MinIO, which speaks
// the same S3 API) lives.
//
// Useful pieces from @aws-sdk/client-s3 and @aws-sdk/lib-storage:
//   - new S3Client({ endpoint, region, credentials, forcePathStyle })
//   - PutObjectCommand            (simple, whole-buffer upload)
//   - Upload (from lib-storage)   (multipart upload, better for streams/large files)
//   - GetObjectCommand            (returns a Body that's a readable stream)
//   - DeleteObjectCommand
//   - getSignedUrl (from @aws-sdk/s3-request-presigner, for pre-signed URLs)
//
// TODO:
// - export a getFileStream(key) function that returns a readable stream
//   (this is the piece that lets the controller stream the download
//   instead of loading the whole file into memory)

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "../config/env.js";

export const s3Client = new S3Client({
    endpoint: config.s3.endpoint,
    region: config.s3.region,
    forcePathStyle: config.s3.forcePathStyle,
    credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
    },
});

export function uploadFile(fileBuffer, key, contentType) {
    const command = new PutObjectCommand({
        Bucket: config.s3.bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
    });
    return s3Client.send(command);
}