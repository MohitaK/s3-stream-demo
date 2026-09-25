import { Router } from "express";
// import upload from "../middleware/upload.middleware.js";
// import * as filesController from "../controllers/files.controller.js";

const router = Router();

// TODO (you): wire these up once the controller functions exist.
//
// POST /api/files/upload
//   - use the multer middleware to parse an incoming multipart file
//   - hand the file stream/buffer to filesController.uploadFile
//
// router.post("/upload", upload.single("file"), filesController.uploadFile);

// GET /api/files/:key/download
//   - stream the object back from S3 to the response, don't buffer
//     the whole file in memory
//
// router.get("/:key/download", filesController.downloadFile);

// GET /api/files
//   - list uploaded files (optional, nice-to-have once the basics work)
//
// router.get("/", filesController.listFiles);

export default router;
