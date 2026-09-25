// Central place to load and validate environment variables.
// Import this instead of calling process.env.X directly elsewhere,
// so there's one source of truth and you fail fast if something's missing.

import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 4000,

  s3: {
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    bucket: process.env.S3_BUCKET,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  },

  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
  },
};
