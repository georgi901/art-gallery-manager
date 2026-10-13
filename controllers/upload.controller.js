const asyncHandler = require('../middleware/asyncHandler');
const service = require('../services/upload.service');

const uploadArtworkImage = asyncHandler(async (req, res) => {
  const imageUrl = await service.replaceArtworkImage(Number(req.params.id), req.file);
  res.json({ data: { imageUrl }, message: 'Artwork image uploaded successfully' });
});

module.exports = {
  uploadArtworkImage,
};
