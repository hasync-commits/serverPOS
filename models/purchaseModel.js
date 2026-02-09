const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  purchaseId: { type: String, required: true, unique: true },

  seq: { type: Number, required: true, unique: true, index: true },

  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },

  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: { type: Number, required: true, min: 1 },
    costPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },

    returnable: { type: Boolean, default: true },
    returnWindowDays: { type: Number, default: 7, min: 0 }
  }],

  totalAmount: { type: Number, required: true, min: 0 },

  purchaseDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
