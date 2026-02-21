const saleItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  productName: { type: String, required: true },
  category: { type: String },
  brand: { type: String },

  costPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },

  quantity: {
    type: Number,
    required: true,
    min: 1
  },

  discount: {
    type: Number,
    default: 0,
    min: 0
  },

  lineTotal: {
    type: Number,
    required: true
  }

}, { _id: false });

const saleSchema = new mongoose.Schema({

  saleCode: {
    type: String,
    required: true,
    unique: true
  },

  customerName: {
    type: String,
    trim: true
  },

  items: {
    type: [saleItemSchema],
    required: true
  },

  subtotal: {
    type: Number,
    required: true
  },

  totalDiscount: {
    type: Number,
    required: true
  },

  grandTotal: {
    type: Number,
    required: true
  },

  paidAmount: {
    type: Number,
    required: true,
    min: 0
  },

  isFullyPaid: {
    type: Boolean,
    default: true
  },

  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Online Wallets'],
    required: true
  },

  createdBy: {
    type: String,
    required: true
  }

}, { timestamps: true });