// The consumer side: a SEPARATE process from your API server (run it
// with `npm run worker`). It picks up jobs and does the actual work —
// e.g. reading the file back from S3 as a stream and processing it.
//
// TODO (you):
// - import { Worker } from "bullmq"
// - create a Worker instance for the same queue name, with a processor
//   function that receives each job and does something with it
//   (this is a great place to practice streaming: pull the file from
//   S3 via s3.service.getFileStream and process it chunk by chunk)
// - add basic logging for job completed / job failed events
