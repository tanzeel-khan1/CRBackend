const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getProperties, createProperty, updateProperty, deleteProperty } = require('../controllers/propertyController');
const multer = require('multer');
const { propertyImageStorage } = require('../config/cloudinaryConfig');

const uploadPropertyPhotos = multer({
	storage: propertyImageStorage,
	limits: { files: 10, fileSize: 8 * 1024 * 1024 },
});

const handlePropertyPhotoUpload = (req, res, next) => {
	uploadPropertyPhotos.array('photos', 10)(req, res, (error) => {
		if (!error) return next();

		const message = error.message?.toLowerCase().includes('signature')
			? 'Cloudinary signature rejected. Verify CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
			: error.message || 'Property photo upload failed';

		return res.status(400).json({ message });
	});
};

router.use(protect);
router.route('/').get(getProperties).post(handlePropertyPhotoUpload, createProperty);
router.route('/:id').put(handlePropertyPhotoUpload, updateProperty).delete(deleteProperty);

module.exports = router;