import { S3Client } from "@aws-sdk/client-s3";
import { config } from "./config.js";

// One shared S3 client for the whole process. Works against MinIO or real
// AWS S3 unchanged — only the endpoint/credentials in .env differ.
export const s3 = new S3Client({
  endpoint: config.s3.endpoint,
  region: config.s3.region,
  forcePathStyle: config.s3.forcePathStyle,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  },
});
