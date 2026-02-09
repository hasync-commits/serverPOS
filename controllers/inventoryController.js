const Product = require('../models/productModel');
const Purchase = require('../models/purchaseModel');
const Sale = require('../models/saleModel');
const Return = require('../models/returnModel');
const sendResponse = require('../utils/response');

/**
 * INVENTORY OVERVIEW (DASHBOARD)
 */
exports.getInventoryOverview = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });

    const products = await Product.find({ isActive: true }).select('stock lowStockThreshold');

    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStockCount = products.filter(p => p.stock <= p.lowStockThreshold && p.stock > 0).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;

    sendResponse(res, 200, true, 'Inventory overview fetched', {
      totalProducts,
      totalStock,
      lowStockCount,
      outOfStockCount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PRODUCT-WISE INVENTORY LIST
 */
exports.getInventoryProducts = async (req, res, next) => {
  try {
    const {
      category,
      lowStock,
      outOfStock,
      page = 1,
      limit = 10
    } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (outOfStock === 'true') filter.stock = 0;

    let query = Product.find(filter);

    if (lowStock === 'true') {
      query = query.where({
        $expr: { $lte: ['$stock', '$lowStockThreshold'] }
      });
    }

    const products = await query
      .select('name category stock lowStockThreshold')
      .sort({ stock: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    sendResponse(res, 200, true, 'Inventory products fetched', products);
  } catch (error) {
    next(error);
  }
};

/**
 * SINGLE PRODUCT INVENTORY DETAILS
 */
exports.getInventoryProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId)
      .select('name stock lowStockThreshold');

    if (!product) {
      return sendResponse(res, 404, false, 'Product not found');
    }

    let status = 'OK';
    if (product.stock === 0) status = 'OUT';
    else if (product.stock <= product.lowStockThreshold) status = 'LOW';

    sendResponse(res, 200, true, 'Product inventory fetched', {
      productId: product._id,
      name: product.name,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      status
    });
  } catch (error) {
    next(error);
  }
};

/**
 * INVENTORY MOVEMENTS (AUDIT TRAIL)
 */
exports.getInventoryMovements = async (req, res, next) => {
  try {
    const {
      product,
      type,
      fromDate,
      toDate,
      page = 1,
      limit = 10
    } = req.query;

    const movements = [];

    // Purchases → IN
    if (!type || type === 'Purchase') {
      const purchases = await Purchase.find(
        product ? { 'products.product': product } : {}
      )
        .populate('products.product', 'name')
        .select('products purchaseDate');

      purchases.forEach(p => {
        p.products.forEach(item => {
          if (!product || item.product._id.toString() === product) {
            movements.push({
              type: 'Purchase',
              product: item.product.name,
              quantity: item.quantity,
              date: p.purchaseDate
            });
          }
        });
      });
    }

    // Sales → OUT
    if (!type || type === 'Sale') {
      const sales = await Sale.find(
        product ? { 'products.product': product } : {}
      )
        .populate('products.product', 'name')
        .select('products saleDate');

      sales.forEach(s => {
        s.products.forEach(item => {
          if (!product || item.product._id.toString() === product) {
            movements.push({
              type: 'Sale',
              product: item.product.name,
              quantity: -item.quantity,
              date: s.saleDate
            });
          }
        });
      });
    }

    // Returns → IN / OUT
    if (!type || type === 'Return') {
      const returns = await Return.find(
        product ? { 'products.product': product } : {}
      )
        .populate('products.product', 'name')
        .select('products returnDate referenceModel');

      returns.forEach(r => {
        r.products.forEach(item => {
          if (!product || item.product._id.toString() === product) {
            movements.push({
              type: 'Return',
              product: item.product.name,
              quantity:
                r.referenceModel === 'Sale' && item.restock
                  ? item.quantity
                  : -item.quantity,
              date: r.returnDate
            });
          }
        });
      });
    }

    // Date filter
    let filtered = movements;
    if (fromDate) filtered = filtered.filter(m => m.date >= new Date(fromDate));
    if (toDate) filtered = filtered.filter(m => m.date <= new Date(toDate));

    // Sort newest first
    filtered.sort((a, b) => b.date - a.date);

    // Pagination
    const paginated = filtered.slice(
      (page - 1) * limit,
      page * limit
    );

    sendResponse(res, 200, true, 'Inventory movements fetched', paginated);
  } catch (error) {
    next(error);
  }
};

/**
 * LOW STOCK INVENTORY
 */
exports.getLowStockInventory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const products = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    })
      .select('name stock lowStockThreshold')
      .sort({ stock: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    sendResponse(res, 200, true, 'Low stock inventory fetched', products);
  } catch (error) {
    next(error);
  }
};
