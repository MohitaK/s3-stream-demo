import "dotenv/config";

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),

  s3: {
    endpoint: required("S3_ENDPOINT", "http://localhost:9000"),
    region: required("S3_REGION", "us-east-1"),
    accessKeyId: required("S3_ACCESS_KEY", "minioadmin"),
    secretAccessKey: required("S3_SECRET_KEY", "minioadmin"),
    bucket: required("S3_BUCKET", "uploads"),
    forcePathStyle: (process.env.S3_FORCE_PATH_STYLE ?? "true") === "true",
  },

  redisUrl: required("REDIS_URL", "redis://localhost:6379"),

  corsOrigin: (process.env.CORS_ORIGIN ?? "http://localhost:5173").split(","),
};
