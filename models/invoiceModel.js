const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  
  invoiceId: { type: String, required: true, unique: true },

  seq: { type: Number, required: true, unique: true, index: true },

  referenceModel: {
    type: String,
    enum: ['Sale', 'Purchase'],
    required: true
  },

  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceModel',
    required: true
  },

  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 }
  }],

  totalAmount: { type: Number, required: true, min: 0 },

  invoiceDate: { type: Date, default: Date.now }

}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
