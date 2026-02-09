const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  
  alertId: { type: String, required: true, unique: true },

  seq: { type: Number, required: true, unique: true, index: true },

  type: {
    type: String,
    enum: ['LowStock', 'Return', 'PaymentDue'],
    required: true
  },

  message: { type: String, required: true },

  relatedModel: { type: String },

  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },

  isRead: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
