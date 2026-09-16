const Property = require('../models/Property');
const { canAccessCompany } = require('../middleware/companyAccess');

const hasCompanyAccess = (req, companyId) => canAccessCompany(req.user.email, companyId);

const getRequestedCompanyId = (req) => (
  req.body.company_id
  || req.user.activeCompany?.id
  || req.user.activeCompany?._id
);

const getUploadedPhotoUrls = (req) => (
  Array.isArray(req.files) ? req.files.map((file) => file.path).filter(Boolean) : []
);

const getExistingPhotos = (value) => {
  if (!value) return null;
  try {
    const photos = JSON.parse(value);
    return Array.isArray(photos) ? photos.filter((photo) => typeof photo === 'string') : [];
  } catch {
    return [];
  }
};

const getProperties = async (req, res) => {
  try {
    const { company_id: companyId } = req.query;
    if (!companyId || !(await hasCompanyAccess(req, companyId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filter = { company_id: companyId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.listing_type) filter.listing_type = req.query.listing_type;

    res.json(await Property.find(filter).sort({ createdAt: -1 }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProperty = async (req, res) => {
  try {
    const companyId = getRequestedCompanyId(req);
    if (!companyId || !(await hasCompanyAccess(req, companyId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const data = {
      ...req.body,
      company_id: companyId,
      photos: getUploadedPhotoUrls(req),
      created_by: req.user.email,
    };
    delete data.existing_photos;

    const property = await Property.create(data);
    res.status(201).json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (!(await hasCompanyAccess(req, property.company_id.toString()))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const data = { ...req.body };
    delete data.company_id;
    delete data.created_by;
    delete data.existing_photos;

    const uploadedPhotos = getUploadedPhotoUrls(req);
    const existingPhotos = getExistingPhotos(req.body.existing_photos);
    if (uploadedPhotos.length || existingPhotos) {
      data.photos = [...(existingPhotos || property.photos || []), ...uploadedPhotos];
    }

    const updated = await Property.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (!(await hasCompanyAccess(req, property.company_id.toString()))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProperties, createProperty, updateProperty, deleteProperty };