const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({

  supplierId: { type: String, required: true, unique: true },

  seq: { type: Number, required: true, unique: true, index: true },

  name: { type: String, required: true },
  contactNumber: { type: String },
  email: { type: String, lowercase: true, trim: true },
  address: { type: String },

  paymentTerms: { type: String }
  
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
