const Product = require('../models/productModel');
const sendResponse = require('../utils/response');

/**
 * CREATE PRODUCT
 */
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      category,
      description,
      costPrice,
      sellingPrice,
      lowStockThreshold
    } = req.body;

    if (!name || costPrice === undefined || sellingPrice === undefined) {
      return sendResponse(res, 400, false, 'Required fields missing');
    }

    const product = await Product.create({
      productId: `PRD-${Date.now()}`,
      seq: Date.now(), // replace with counter util later
      name,
      category,
      description,
      costPrice,
      sellingPrice,
      lowStockThreshold
    });

    sendResponse(res, 201, true, 'Product created successfully', product);
  } catch (error) {
    next(error);
  }
};

/**
 * GET PRODUCTS (WITH ALL FILTERS)
 */
exports.getProducts = async (req, res, next) => {
  try {
    const {
      category,
      lowStock,
      isActive,
      fromDate,
      toDate,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    if (minPrice || maxPrice) {
      filter.sellingPrice = {};
      if (minPrice) filter.sellingPrice.$gte = Number(minPrice);
      if (maxPrice) filter.sellingPrice.$lte = Number(maxPrice);
    }

    let query = Product.find(filter);

    // Low stock filter using expression
    if (lowStock === 'true') {
      query = query.where({
        $expr: { $lte: ['$stock', '$lowStockThreshold'] }
      });
    }

    const products = await query
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    sendResponse(res, 200, true, 'Products fetched successfully', products);
  } catch (error) {
    next(error);
  }
};

/**
 * GET PRODUCT BY ID
 */
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return sendResponse(res, 404, false, 'Product not found');
    }

    sendResponse(res, 200, true, 'Product fetched successfully', product);
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE PRODUCT (NO STOCK CHANGE)
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const updates = req.body;

    if ('stock' in updates) {
      return sendResponse(res, 400, false, 'Direct stock update not allowed');
    }

    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      updates,
      { new: true }
    );

    if (!product) {
      return sendResponse(res, 404, false, 'Product not found');
    }

    sendResponse(res, 200, true, 'Product updated successfully', product);
  } catch (error) {
    next(error);
  }
};

/**
 * ENABLE / DISABLE PRODUCT
 */
exports.updateProductStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (isActive === undefined) {
      return sendResponse(res, 400, false, 'isActive is required');
    }

    const product = await Product.findById(req.params.productId);
    if (!product) {
      return sendResponse(res, 404, false, 'Product not found');
    }

    product.isActive = isActive;
    await product.save();

    sendResponse(res, 200, true, 'Product status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET LOW STOCK PRODUCTS (FAST PATH)
 */
exports.getLowStockProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const products = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      isActive: true
    })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ stock: 1 });

    sendResponse(res, 200, true, 'Low stock products fetched', products);
  } catch (error) {
    next(error);
  }
};
