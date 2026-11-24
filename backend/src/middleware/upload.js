const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const { BadRequestError } = require('../utils/errors');

const UPLOADS_ROOT = path.join(__dirname, '..', '..', process.env.UPLOADS_DIR || 'uploads');
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB — plenty for a COA/MSDS/POD PDF or photo

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp']);

// Creates a multer instance that saves single files into
// uploads/<category>/<uuid>-<sanitized-original-name>.
function createUploader(category) {
  const destDir = path.join(UPLOADS_ROOT, category);
  fs.mkdirSync(destDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, destDir),
    filename: (req, file, cb) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${crypto.randomUUID()}-${safeName}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
      // Check the extension as well as the (client-supplied, spoofable) MIME
      // type, so a ".html" file can't be stored by claiming to be an image.
      const ext = path.extname(file.originalname).toLowerCase();
      if (!ALLOWED_MIME_TYPES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
        return cb(new BadRequestError('Only PDF, PNG, JPEG, or WEBP files are allowed'));
      }
      cb(null, true);
    },
  });
}

// Given a saved file's absolute path, returns the URL the frontend can use
// to reference it (served through the authenticated /api/v1/files route —
// there is deliberately no public static folder).
function fileUrlFor(category, filename) {
  const base = process.env.PUBLIC_UPLOADS_BASE_URL || 'http://localhost:4000/uploads';
  return `${base}/${category}/${filename}`;
}

// For files the server generates itself (quotation/invoice PDFs) rather
// than something the browser uploads via multer — we already have the
// bytes, so just write them to the category folder and return the URL.
function saveGeneratedFile(category, filename, buffer) {
  const destDir = path.join(UPLOADS_ROOT, category);
  fs.mkdirSync(destDir, { recursive: true });
  fs.writeFileSync(path.join(destDir, filename), buffer);
  return fileUrlFor(category, filename);
}

module.exports = { createUploader, fileUrlFor, saveGeneratedFile, UPLOADS_ROOT };
