const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
  
  returnId: { type: String, required: true, unique: true },

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
    restock: { type: Boolean, default: true },
    reason: { type: String }
  }],

  returnDate: { type: Date, default: Date.now }

}, { timestamps: true });

module.exports = mongoose.model('Return', returnSchema);
