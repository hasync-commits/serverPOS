const Sale = require('../models/saleModel');
const Purchase = require('../models/purchaseModel');
const Product = require('../models/productModel');
const sendResponse = require('../utils/response');

/**
 * SALES REPORT
 * Daily / Weekly / Monthly / Yearly
 */
exports.salesReport = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    const match = {};
    if (fromDate || toDate) {
      match.saleDate = {};
      if (fromDate) match.saleDate.$gte = new Date(fromDate);
      if (toDate) match.saleDate.$lte = new Date(toDate);
    }

    const report = await Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    sendResponse(res, 200, true, 'Sales report generated', report[0] || {});
  } catch (error) {
    next(error);
  }
};

/**
 * PURCHASE REPORT
 */
exports.purchaseReport = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    const match = {};
    if (fromDate || toDate) {
      match.purchaseDate = {};
      if (fromDate) match.purchaseDate.$gte = new Date(fromDate);
      if (toDate) match.purchaseDate.$lte = new Date(toDate);
    }

    const report = await Purchase.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalPurchases: { $sum: '$totalAmount' },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    sendResponse(res, 200, true, 'Purchase report generated', report[0] || {});
  } catch (error) {
    next(error);
  }
};

/**
 * PROFIT REPORT (GLOBAL)
 * Profit = Sales - Purchases
 */
exports.profitReport = async (req, res, next) => {
  try {
    const sales = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const purchases = await Purchase.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const totalSales = sales[0]?.total || 0;
    const totalPurchases = purchases[0]?.total || 0;

    sendResponse(res, 200, true, 'Profit report generated', {
      totalSales,
      totalPurchases,
      profit: totalSales - totalPurchases
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PRODUCT-WISE PROFIT REPORT
 */
exports.productProfitReport = async (req, res, next) => {
  try {
    const report = await Sale.aggregate([
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.product',
          revenue: { $sum: '$products.total' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          productName: '$product.name',
          revenue: 1
        }
      }
    ]);

    sendResponse(res, 200, true, 'Product-wise profit report generated', report);
  } catch (error) {
    next(error);
  }
};

/**
 * STOCK REPORT
 */
exports.stockReport = async (req, res, next) => {
  try {
    const products = await Product.find({})
      .select('name stock lowStockThreshold')
      .sort({ stock: 1 });

    sendResponse(res, 200, true, 'Stock report generated', products);
  } catch (error) {
    next(error);
  }
};
