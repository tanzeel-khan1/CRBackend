const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    property_type: {
      type: String,
      enum: ['House', 'Apartment', 'Villa', 'Plot', 'Commercial', 'Office', 'Other'],
      default: 'House',
    },
    listing_type: {
      type: String,
      enum: ['Sale', 'Rent'],
      default: 'Sale',
    },
    status: {
      type: String,
      enum: ['Available', 'Reserved', 'Sold', 'Rented', 'Off Market'],
      default: 'Available',
    },
    price: { type: Number, required: true, min: 0 },
    address: { type: String, required: true, trim: true },
    bedrooms: { type: Number, min: 0, default: 0 },
    bathrooms: { type: Number, min: 0, default: 0 },
    area: { type: Number, min: 0, default: 0 },
    description: { type: String, trim: true, default: '' },
    photos: [{ type: String }],
    created_by: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Property', propertySchema);