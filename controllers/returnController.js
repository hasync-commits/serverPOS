const mongoose = require('mongoose');
const Return = require('../models/returnModel');
const Sale = require('../models/saleModel');
const Purchase = require('../models/purchaseModel');
const Product = require('../models/productModel');
const sendResponse = require('../utils/response');

/**
 * CREATE RETURN (SALE / PURCHASE)
 */
exports.createReturn = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      referenceModel,
      referenceId,
      products,
      returnDate
    } = req.body;

    if (!referenceModel || !referenceId || !products?.length) {
      return sendResponse(res, 400, false, 'Invalid return data');
    }

    if (!['Sale', 'Purchase'].includes(referenceModel)) {
      return sendResponse(res, 400, false, 'Invalid reference model');
    }

    const referenceDoc =
      referenceModel === 'Sale'
        ? await Sale.findById(referenceId).session(session)
        : await Purchase.findById(referenceId).session(session);

    if (!referenceDoc) {
      return sendResponse(res, 404, false, `${referenceModel} not found`);
    }

    const processedProducts = [];

    for (const item of products) {
      const { product, quantity, restock, reason } = item;

      if (!product || !quantity) {
        await session.abortTransaction();
        return sendResponse(res, 400, false, 'Invalid product data');
      }

      const originalItem = referenceDoc.products.find(
        p => p.product.toString() === product
      );

      if (!originalItem) {
        await session.abortTransaction();
        return sendResponse(res, 400, false, 'Product not in original transaction');
      }

      if (quantity > originalItem.quantity) {
        await session.abortTransaction();
        return sendResponse(res, 400, false, 'Return quantity exceeds original quantity');
      }

      // PURCHASE RETURN VALIDATION
      if (referenceModel === 'Purchase') {
        if (!originalItem.returnable) {
          await session.abortTransaction();
          return sendResponse(res, 400, false, 'Product is not returnable');
        }

        const allowedTill = new Date(referenceDoc.purchaseDate);
        allowedTill.setDate(
          allowedTill.getDate() + originalItem.returnWindowDays
        );

        if (new Date() > allowedTill) {
          await session.abortTransaction();
          return sendResponse(res, 400, false, 'Return window expired');
        }
      }

      // INVENTORY ADJUSTMENT
      if (referenceModel === 'Sale' && restock === true) {
        await Product.updateOne(
          { _id: product },
          { $inc: { stock: quantity } },
          { session }
        );
      }

      if (referenceModel === 'Purchase' && restock === false) {
        await Product.updateOne(
          { _id: product },
          { $inc: { stock: -quantity } },
          { session }
        );
      }

      processedProducts.push({
        product,
        quantity,
        restock: restock ?? true,
        reason
      });
    }

    const createdReturn = await Return.create(
      [{
        returnId: `RET-${Date.now()}`,
        seq: Date.now(), // replace with counter util later
        referenceModel,
        referenceId,
        products: processedProducts,
        returnDate: returnDate || Date.now()
      }],
      { session }
    );

    await session.commitTransaction();

    sendResponse(res, 201, true, 'Return created successfully', createdReturn[0]);

  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

/**
 * GET RETURNS (WITH FILTERS)
 */
exports.getReturns = async (req, res, next) => {
  try {
    const {
      referenceModel,
      product,
      fromDate,
      toDate,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};
    if (referenceModel) filter.referenceModel = referenceModel;
    if (product) filter['products.product'] = product;

    if (fromDate || toDate) {
      filter.returnDate = {};
      if (fromDate) filter.returnDate.$gte = new Date(fromDate);
      if (toDate) filter.returnDate.$lte = new Date(toDate);
    }

    const returns = await Return.find(filter)
      .populate('products.product', 'name')
      .sort({ returnDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    sendResponse(res, 200, true, 'Returns fetched successfully', returns);
  } catch (error) {
    next(error);
  }
};

/**
 * GET RETURN BY ID
 */
exports.getReturnById = async (req, res, next) => {
  try {
    const ret = await Return.findById(req.params.returnId)
      .populate('products.product', 'name');

    if (!ret) {
      return sendResponse(res, 404, false, 'Return not found');
    }

    sendResponse(res, 200, true, 'Return fetched successfully', ret);
  } catch (error) {
    next(error);
  }
};

/**
 * GET RETURN PRODUCTS
 */
exports.getReturnProducts = async (req, res, next) => {
  try {
    const ret = await Return.findById(req.params.returnId)
      .select('products')
      .populate('products.product', 'name');

    if (!ret) {
      return sendResponse(res, 404, false, 'Return not found');
    }

    sendResponse(res, 200, true, 'Return products fetched', ret.products);
  } catch (error) {
    next(error);
  }
};

/**
 * GET RETURNS BY REFERENCE (SALE / PURCHASE)
 */
exports.getReturnsByReference = async (req, res, next) => {
  try {
    const { referenceModel } = req.query;

    if (!referenceModel) {
      return sendResponse(res, 400, false, 'referenceModel is required');
    }

    const returns = await Return.find({
      referenceModel,
      referenceId: req.params.referenceId
    }).populate('products.product', 'name');

    sendResponse(res, 200, true, 'Returns fetched successfully', returns);
  } catch (error) {
    next(error);
  }
};
