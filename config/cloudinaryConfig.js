// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const propertyImageStorage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: 'ranvola_os_properties',
//     resource_type: 'image',
//     allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
//     transformation: [
//       {
//         width: 1200,
//         height: 1200,
//         crop: 'limit',
//         quality: 'auto',
//         fetch_format: 'auto',
//       },
//     ],
//   },
// });

// const documentStorage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => ({
//     folder: 'ranvola_os_documents',
//     resource_type: file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf' ? 'image' : 'raw',
//     type: 'upload',
//     access_control: [{ access_type: 'anonymous' }],
//     allowed_formats: [
//       'jpg', 'jpeg', 'png', 'webp', 'avif', 'pdf', 'doc', 'docx',
//       'xls', 'xlsx', 'csv', 'txt', 'zip',
//     ],
//   }),
// });

// module.exports = { cloudinary, propertyImageStorage, documentStorage };



const cloudinary = require("cloudinary").v2;
const { Transform } = require("stream");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Custom Multer storage engine using Cloudinary SDK v2
function createCloudinaryStorage(getOptions) {
  return {
    _handleFile(req, file, callback) {
      const options = getOptions(req, file);

      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) return callback(error);

          callback(null, {
            filename: result.public_id,
            path: result.secure_url,
            size: result.bytes,
            resource_type: result.resource_type,
            type: result.type,
          });
        }
      );

      file.stream.on("error", (error) => {
        uploadStream.destroy(error);
      });

      file.stream.pipe(uploadStream);
    },

    _removeFile(req, file, callback) {
      if (!file.filename) return callback(null);

      cloudinary.uploader
        .destroy(file.filename, {
          resource_type: file.resource_type || "image",
          type: file.type || "upload",
        })
        .then(() => callback(null))
        .catch(callback);
    },
  };
}

// Property images
const propertyImageStorage = createCloudinaryStorage(() => ({
  folder: "ranvola_os_properties",
  resource_type: "image",
  allowed_formats: ["jpg", "jpeg", "png", "webp"],
  transformation: [
    {
      width: 1200,
      height: 1200,
      crop: "limit",
      quality: "auto",
      fetch_format: "auto",
    },
  ],
}));

// Documents
const documentStorage = createCloudinaryStorage((req, file) => ({
  folder: "ranvola_os_documents",

  resource_type:
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
      ? "image"
      : "raw",

  type: "upload",

  allowed_formats: [
    "jpg", "jpeg", "png", "webp", "avif",
    "pdf", "doc", "docx", "xls", "xlsx",
    "csv", "txt", "zip",
  ],
}));

module.exports = {
  cloudinary,
  propertyImageStorage,
  documentStorage,
};
