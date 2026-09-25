// Small wrapper around fetch() for talking to the Express API.
// Keeps the base URL and error handling in one place instead of
// repeated in every component.

const API_BASE = "http://localhost:4000/api";

// TODO (you):
// - export an uploadFile(file) function that POSTs a FormData containing
//   the file to `${API_BASE}/files/upload` (use fetch, no need for axios)
// - export a getDownloadUrl(key) helper (or a downloadFile(key) function)
//   for GET `${API_BASE}/files/:key/download`
