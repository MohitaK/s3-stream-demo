import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import filesRouter from "./routes/files.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// TODO (you): once files.routes.js has real handlers, this mounts them
// under /api/files (e.g. POST /api/files/upload, GET /api/files/:key)
app.use("/api/files", filesRouter);

app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});
