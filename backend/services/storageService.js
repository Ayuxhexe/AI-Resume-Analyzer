const fs = require('fs/promises');
const path = require('path');
const { cloudinary, isCloudinaryEnabled } = require('../config/cloudinary');

const getFileBuffer = async (file) => {
  if (file.buffer) {
    return file.buffer;
  }

  if (file.path) {
    return fs.readFile(file.path);
  }

  throw new Error('No uploaded file content was found.');
};

const uploadToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'ai-resume-analyzer/resumes',
        resource_type: 'raw',
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve(result);
      },
    );

    uploadStream.end(file.buffer);
  });

const persistUploadedResume = async (file) => {
  if (isCloudinaryEnabled) {
    const result = await uploadToCloudinary(file);

    return {
      fileUrl: result.secure_url,
      filePublicId: result.public_id,
      storageProvider: 'cloudinary',
    };
  }

  return {
    fileUrl: `/uploads/${path.basename(file.path)}`,
    filePublicId: null,
    storageProvider: 'local',
  };
};

const cleanupStoredResume = async ({ file, storedAsset }) => {
  try {
    if (storedAsset?.storageProvider === 'cloudinary' && storedAsset.filePublicId) {
      await cloudinary.uploader.destroy(storedAsset.filePublicId, {
        resource_type: 'raw',
      });
      return;
    }

    if (file?.path) {
      await fs.unlink(file.path);
    }
  } catch (_error) {
    // Best-effort cleanup so a failed request does not cascade into a second failure.
  }
};

module.exports = {
  cleanupStoredResume,
  getFileBuffer,
  persistUploadedResume,
};
