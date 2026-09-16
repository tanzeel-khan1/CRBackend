const Property = require('../models/Property');
const { canAccessCompany } = require('../middleware/companyAccess');

const hasCompanyAccess = (req, companyId) => canAccessCompany(req.user.email, companyId);

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
    const data = { ...req.body };
    if (!data.company_id || !(await hasCompanyAccess(req, data.company_id))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const property = await Property.create({ ...data, created_by: req.user.email });
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