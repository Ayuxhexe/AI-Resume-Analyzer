const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { isCloudinaryEnabled } = require('../config/cloudinary');

const uploadsDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const localStorage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadsDir);
  },
  filename: (_req, file, callback) => {
    const safeName = file.originalname.replace(/\s+/g, '-').toLowerCase();
    callback(null, `${Date.now()}-${safeName}`);
  },
});

const fileFilter = (_req, file, callback) => {
  if (file.mimetype !== 'application/pdf') {
    return callback(new Error('Only PDF files are allowed.'));
  }

  return callback(null, true);
};

const upload = multer({
  storage: isCloudinaryEnabled ? multer.memoryStorage() : localStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;
