const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({

  purchaseId: { type: String, required: true, unique: true },
  seq: { type: Number, required: true, unique: true, index: true },

  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },

  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: { type: Number, required: true },
      costPrice: { type: Number, required: true },
      total: { type: Number, required: true },

      returnable: { type: Boolean, default: true },
      returnWindowDays: { type: Number, default: 7 }
    }
  ],

  totalAmount: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now }
  
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
