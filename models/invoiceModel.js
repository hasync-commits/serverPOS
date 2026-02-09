const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({

  invoiceId: { type: String, required: true, unique: true },
  seq: { type: Number, required: true, unique: true, index: true },

  type: {
    type: String,
    enum: ['Sale', 'Purchase'],
    required: true
  },

  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'type'
  },

  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      total: { type: Number, required: true }
    }
  ],

  totalAmount: { type: Number, required: true },
  invoiceDate: { type: Date, default: Date.now }
  
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
