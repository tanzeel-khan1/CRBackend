const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const propertyImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'tbuilds_os_properties',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      {
        width: 1200,
        height: 1200,
        crop: 'limit',
        quality: 'auto',
        fetch_format: 'auto',
      },
    ],
  },
});

const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'tbuilds_os_documents',
    resource_type: 'auto',
    allowed_formats: [
      'jpg', 'jpeg', 'png', 'webp', 'avif', 'pdf', 'doc', 'docx',
      'xls', 'xlsx', 'csv', 'txt', 'zip',
    ],
  },
});

module.exports = { cloudinary, propertyImageStorage, documentStorage };