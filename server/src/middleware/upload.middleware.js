// Multer handles multipart/form-data parsing for file uploads.
// Keeping memoryStorage() (simple, keeps whole file in RAM for small files) vs a streaming approach later

import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(),
});

export default upload;