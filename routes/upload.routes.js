const express = require('express');
const multer = require('multer');

const { uploadArtworkImage } = require('../controllers/upload.controller');
const asyncHandler = require('../middleware/asyncHandler');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const AppError = require('../utils/AppError');

const router = express.Router();
const maxUploadBytes = Number(process.env.MAX_UPLOAD_MB || 5) * 1024 * 1024;
const upload = multer({
  dest: process.env.UPLOAD_DIR || 'uploads',
  limits: { fileSize: maxUploadBytes },
});

router.post(
  '/artworks/:id/image',
  authenticate,
  authorize('ADMIN', 'CURATOR'),
  upload.single('image'),
  asyncHandler(uploadArtworkImage)
);

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    next(new AppError(413, 'FILE_TOO_LARGE', 'Uploaded file exceeds the size limit'));
    return;
  }
  next(error);
});

module.exports = router;
