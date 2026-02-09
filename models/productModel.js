const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

  productId: { type: String, required: true, unique: true },

  seq: { type: Number, required: true, unique: true, index: true },

  name: { type: String, required: true },
  category: { type: String },
  description: { type: String },

  costPrice: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },

  stock: { type: Number, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 5, min: 0 }
  
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
