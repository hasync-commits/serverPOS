const mongoose = require('mongoose');
const Sale = require('../models/saleModel');
const Product = require('../models/productModel');
const sendResponse = require('../utils/response');

/**
 * CREATE SALE (DECREASE INVENTORY)
 */
exports.createSale = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      products,
      customerName,
      paymentMethod = 'Cash',
      saleDate
    } = req.body;

    if (!products || !products.length) {
      return sendResponse(res, 400, false, 'Products are required');
    }

    let totalAmount = 0;
    const processedProducts = [];

    for (const item of products) {
      const { product, quantity, unitPrice } = item;

      if (!product || !quantity || !unitPrice) {
        await session.abortTransaction();
        return sendResponse(res, 400, false, 'Invalid product data');
      }

      const productDoc = await Product.findById(product).session(session);
      if (!productDoc) {
        await session.abortTransaction();
        return sendResponse(res, 404, false, 'Product not found');
      }

      if (productDoc.stock < quantity) {
        await session.abortTransaction();
        return sendResponse(
          res,
          400,
          false,
          `Insufficient stock for product: ${productDoc.name}`
        );
      }

      const total = quantity * unitPrice;
      totalAmount += total;

      // Decrease stock
      await Product.updateOne(
        { _id: product },
        { $inc: { stock: -quantity } },
        { session }
      );

      processedProducts.push({
        product,
        quantity,
        unitPrice,
        total
      });
    }

    const sale = await Sale.create(
      [{
        saleId: `SAL-${Date.now()}`,
        seq: Date.now(), // replace with counter util later
        products: processedProducts,
        totalAmount,
        customerName,
        paymentMethod,
        saleDate: saleDate || Date.now()
      }],
      { session }
    );

    await session.commitTransaction();

    sendResponse(res, 201, true, 'Sale created successfully', sale[0]);

  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

/**
 * GET SALES (WITH FILTERS)
 */
exports.getSales = async (req, res, next) => {
  try {
    const {
      product,
      paymentMethod,
      fromDate,
      toDate,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (product) filter['products.product'] = product;

    if (fromDate || toDate) {
      filter.saleDate = {};
      if (fromDate) filter.saleDate.$gte = new Date(fromDate);
      if (toDate) filter.saleDate.$lte = new Date(toDate);
    }

    const sales = await Sale.find(filter)
      .populate('products.product', 'name')
      .sort({ saleDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    sendResponse(res, 200, true, 'Sales fetched successfully', sales);
  } catch (error) {
    next(error);
  }
};

/**
 * GET SALE BY ID
 */
exports.getSaleById = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.saleId)
      .populate('products.product', 'name');

    if (!sale) {
      return sendResponse(res, 404, false, 'Sale not found');
    }

    sendResponse(res, 200, true, 'Sale fetched successfully', sale);
  } catch (error) {
    next(error);
  }
};

/**
 * GET SALE PRODUCTS
 */
exports.getSaleProducts = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.saleId)
      .select('products')
      .populate('products.product', 'name');

    if (!sale) {
      return sendResponse(res, 404, false, 'Sale not found');
    }

    sendResponse(res, 200, true, 'Sale products fetched', sale.products);
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE SALE PAYMENT (OPTIONAL / FUTURE-READY)
 */
exports.updateSalePayment = async (req, res, next) => {
  try {
    const { paymentMethod, paymentReference } = req.body;

    if (!paymentMethod && !paymentReference) {
      return sendResponse(res, 400, false, 'Nothing to update');
    }

    const sale = await Sale.findById(req.params.saleId);
    if (!sale) {
      return sendResponse(res, 404, false, 'Sale not found');
    }

    if (paymentMethod) sale.paymentMethod = paymentMethod;
    if (paymentReference) sale.paymentReference = paymentReference;

    await sale.save();

    sendResponse(res, 200, true, 'Sale payment updated successfully');
  } catch (error) {
    next(error);
  }
};
