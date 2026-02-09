const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  
  saleId: { type: String, required: true, unique: true },

  seq: { type: Number, required: true, unique: true, index: true },

  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 }
  }],

  totalAmount: { type: Number, required: true, min: 0 },

  customerName: { type: String },

  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Mobile'],
    default: 'Cash'
  },

  saleDate: { type: Date, default: Date.now }

}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
