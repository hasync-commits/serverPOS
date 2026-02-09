const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

  productId: { type: String, required: true, unique: true },
  seq: { type: Number, required: true, unique: true, index: true },

  name: { type: String, required: true },
  category: { type: String },
  description: { type: String },

  costPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },

  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 }
  
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
