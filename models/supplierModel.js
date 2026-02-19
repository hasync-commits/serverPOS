const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    code: { type: String, trim: true, required: true, unique: true },

    name: { type: String, required: true, trim: true },

    phone: { type: String, required: true, trim: true },

    email: { type: String, trim: true, lowercase: true },

    address: { type: String, trim: true },

    city: { type: String, trim: true },

    notes: { type: String, trim: true },

    isActive: { type: Boolean, default: true },

    createdBy: { type: String, required: true }

  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Supplier', supplierSchema);
