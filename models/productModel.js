const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

  name: { type: String, required: true, trim: true },

  category: { type: String, trim: true },

  brand: { type: String, trim: true },

  costPrice: { type: Number, required: true, min: 0},

  sellingPrice: { type: Number, required: true, min: 0},

  currentStock: { type: Number, required: true, min: 0 },

  lowStockQuantity: { type: Number, default: 0, min: 0 },

  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },

  purchaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Purchase',
    required: true
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
