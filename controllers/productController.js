const Product = require('../models/productModel');


/* ================= GET ALL PRODUCTS ================= */
/* (For admin/report use — includes zero stock) */

exports.getAllProducts = async (req, res) => {
  try {

    const products = await Product.find()
      .populate('supplierId', 'name')
      .populate('purchaseId', 'purchaseCode')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


/* ================= GET AVAILABLE PRODUCTS ================= */
/* (For Sales — ONLY stock > 0) */

exports.getAvailableProducts = async (req, res) => {
  try {

    const products = await Product.find({
      currentStock: { $gt: 0 }
    })
    .populate('supplierId', 'name')
    .populate('purchaseId', 'purchaseCode')
    .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


/* ================= GET PRODUCT BY ID ================= */

exports.getProductById = async (req, res) => {
  try {

    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('supplierId', 'name')
      .populate('purchaseId', 'purchaseCode');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: product
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


/* ================= LOW STOCK PRODUCTS ================= */

exports.getLowStockProducts = async (req, res) => {
  try {

    const products = await Product.find({
      $expr: { $lte: ['$currentStock', '$lowStockQuantity'] }
    })
    .populate('supplierId', 'name')
    .populate('purchaseId', 'purchaseCode');

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};