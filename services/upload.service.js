const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const AppError = require('../utils/AppError');
const { execute } = require('../db/oracle');

const allowedTypes = new Map([
  ['image/jpeg', { extension: '.jpg', signatures: [Buffer.from([0xff, 0xd8, 0xff])] }],
  ['image/png', { extension: '.png', signatures: [Buffer.from([0x89, 0x50, 0x4e, 0x47])] }],
  ['image/webp', { extension: '.webp', signatures: [Buffer.from('RIFF')] }],
]);

async function validateImage(file) {
  const type = allowedTypes.get(file.mimetype);
  if (!type) {
    await fs.unlink(file.path).catch(() => {});
    throw new AppError(400, 'INVALID_FILE_TYPE', 'Only JPEG, PNG and WebP files are allowed');
  }
  const contents = await fs.readFile(file.path);
  const validSignature = type.signatures.some((signature) =>
    contents.subarray(0, signature.length).equals(signature)
  );
  const validWebp =
    file.mimetype === 'image/webp' && contents.subarray(8, 12).equals(Buffer.from('WEBP'));
  if (!validSignature || (file.mimetype === 'image/webp' && !validWebp)) {
    await fs.unlink(file.path).catch(() => {});
    throw new AppError(400, 'INVALID_FILE_CONTENT', 'The uploaded file is not a valid image');
  }
  return type.extension;
}

async function replaceArtworkImage(id, file) {
  if (!file) throw new AppError(400, 'FILE_REQUIRED', 'An image file is required');
  const extension = await validateImage(file);
  const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });
  const filename = `${crypto.randomUUID()}${extension}`;
  const destination = path.join(uploadDir, filename);
  await fs.rename(file.path, destination);

  const existing = await execute('SELECT IMAGE_URL FROM OPERA WHERE ID_OPERA = :id', { id });
  if (!existing.rows[0]) {
    await fs.unlink(destination).catch(() => {});
    throw new AppError(404, 'NOT_FOUND', 'Artwork not found');
  }

  await execute(
    'UPDATE OPERA SET IMAGE_URL = :imageUrl WHERE ID_OPERA = :id',
    { imageUrl: `/uploads/${filename}`, id },
    { autoCommit: true }
  );

  if (existing.rows[0].IMAGE_URL) {
    const oldFile = path.resolve(
      existing.rows[0].IMAGE_URL.replace(/^\/uploads\//, uploadDir + '/')
    );
    await fs.unlink(oldFile).catch(() => {});
  }

  return `/uploads/${filename}`;
}

module.exports = {
  allowedTypes,
  replaceArtworkImage,
  validateImage,
};
