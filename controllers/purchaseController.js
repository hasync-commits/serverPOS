const mongoose = require('mongoose');
const Purchase = require('../models/purchaseModel');
const Product = require('../models/productModel');
const Supplier = require('../models/supplierModel');
const sendResponse = require('../utils/response');

/**
 * CREATE PURCHASE (INCREASE INVENTORY)
 */
exports.createPurchase = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { supplier, products, purchaseDate } = req.body;

    if (!supplier || !products || !products.length) {
      return sendResponse(res, 400, false, 'Supplier and products are required');
    }

    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists) {
      return sendResponse(res, 404, false, 'Supplier not found');
    }

    let totalAmount = 0;
    const processedProducts = [];

    for (const item of products) {
      const { product, quantity, costPrice, returnable, returnWindowDays } = item;

      if (!product || !quantity || !costPrice) {
        await session.abortTransaction();
        return sendResponse(res, 400, false, 'Invalid product data');
      }

      const productDoc = await Product.findById(product).session(session);
      if (!productDoc) {
        await session.abortTransaction();
        return sendResponse(res, 404, false, 'Product not found');
      }

      const total = quantity * costPrice;
      totalAmount += total;

      // Increase stock
      await Product.updateOne(
        { _id: product },
        { $inc: { stock: quantity } },
        { session }
      );

      processedProducts.push({
        product,
        quantity,
        costPrice,
        total,
        returnable: returnable ?? true,
        returnWindowDays: returnWindowDays ?? 7
      });
    }

    const purchase = await Purchase.create([{
      purchaseId: `PUR-${Date.now()}`,
      seq: Date.now(), // replace with counter util later
      supplier,
      products: processedProducts,
      totalAmount,
      purchaseDate: purchaseDate || Date.now()
    }], { session });

    await session.commitTransaction();

    sendResponse(res, 201, true, 'Purchase created successfully', purchase[0]);

  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

/**
 * GET PURCHASES (WITH FILTERS)
 */
exports.getPurchases = async (req, res, next) => {
  try {
    const {
      supplier,
      product,
      fromDate,
      toDate,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (supplier) filter.supplier = supplier;
    if (product) filter['products.product'] = product;

    if (fromDate || toDate) {
      filter.purchaseDate = {};
      if (fromDate) filter.purchaseDate.$gte = new Date(fromDate);
      if (toDate) filter.purchaseDate.$lte = new Date(toDate);
    }

    const purchases = await Purchase.find(filter)
      .populate('supplier', 'name')
      .populate('products.product', 'name')
      .sort({ purchaseDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    sendResponse(res, 200, true, 'Purchases fetched successfully', purchases);
  } catch (error) {
    next(error);
  }
};

/**
 * GET PURCHASE BY ID
 */
exports.getPurchaseById = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.purchaseId)
      .populate('supplier', 'name')
      .populate('products.product', 'name');

    if (!purchase) {
      return sendResponse(res, 404, false, 'Purchase not found');
    }

    sendResponse(res, 200, true, 'Purchase fetched successfully', purchase);
  } catch (error) {
    next(error);
  }
};

/**
 * GET PURCHASE PRODUCTS
 */
exports.getPurchaseProducts = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.purchaseId)
      .select('products')
      .populate('products.product', 'name');

    if (!purchase) {
      return sendResponse(res, 404, false, 'Purchase not found');
    }

    sendResponse(res, 200, true, 'Purchase products fetched', purchase.products);
  } catch (error) {
    next(error);
  }
};
