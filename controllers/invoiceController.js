const Invoice = require('../models/invoiceModel');
const Sale = require('../models/saleModel');
const Purchase = require('../models/purchaseModel');
const sendResponse = require('../utils/response');

/**
 * CREATE INVOICE (SALE / PURCHASE)
 */
exports.createInvoice = async (req, res, next) => {
  try {
    const { referenceModel, referenceId } = req.body;

    if (!referenceModel || !referenceId) {
      return sendResponse(res, 400, false, 'referenceModel and referenceId are required');
    }

    if (!['Sale', 'Purchase'].includes(referenceModel)) {
      return sendResponse(res, 400, false, 'Invalid referenceModel');
    }

    // Prevent duplicate invoices
    const existingInvoice = await Invoice.findOne({ referenceId });
    if (existingInvoice) {
      return sendResponse(res, 409, false, 'Invoice already exists for this transaction');
    }

    const source =
      referenceModel === 'Sale'
        ? await Sale.findById(referenceId).populate('products.product', 'name')
        : await Purchase.findById(referenceId).populate('products.product', 'name');

    if (!source) {
      return sendResponse(res, 404, false, `${referenceModel} not found`);
    }

    const invoiceProducts = source.products.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: referenceModel === 'Sale' ? item.unitPrice : item.costPrice,
      total: item.total
    }));

    const invoice = await Invoice.create({
      invoiceId: `INV-${Date.now()}`,
      seq: Date.now(), // replace with counter util later
      referenceModel,
      referenceId,
      products: invoiceProducts,
      totalAmount: source.totalAmount,
      invoiceDate: new Date()
    });

    sendResponse(res, 201, true, 'Invoice generated successfully', invoice);
  } catch (error) {
    next(error);
  }
};

/**
 * GET INVOICES (WITH FILTERS)
 */
exports.getInvoices = async (req, res, next) => {
  try {
    const {
      referenceModel,
      fromDate,
      toDate,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};
    if (referenceModel) filter.referenceModel = referenceModel;

    if (fromDate || toDate) {
      filter.invoiceDate = {};
      if (fromDate) filter.invoiceDate.$gte = new Date(fromDate);
      if (toDate) filter.invoiceDate.$lte = new Date(toDate);
    }

    const invoices = await Invoice.find(filter)
      .populate('products.product', 'name')
      .sort({ invoiceDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    sendResponse(res, 200, true, 'Invoices fetched successfully', invoices);
  } catch (error) {
    next(error);
  }
};

/**
 * GET INVOICE BY ID
 */
exports.getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.invoiceId)
      .populate('products.product', 'name');

    if (!invoice) {
      return sendResponse(res, 404, false, 'Invoice not found');
    }

    sendResponse(res, 200, true, 'Invoice fetched successfully', invoice);
  } catch (error) {
    next(error);
  }
};

/**
 * PRINT / DOWNLOAD INVOICE (DATA ONLY)
 */
exports.printInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.invoiceId)
      .populate('products.product', 'name');

    if (!invoice) {
      return sendResponse(res, 404, false, 'Invoice not found');
    }

    // Frontend can render this into PDF / HTML
    sendResponse(res, 200, true, 'Invoice print data', {
      invoiceId: invoice.invoiceId,
      date: invoice.invoiceDate,
      items: invoice.products,
      totalAmount: invoice.totalAmount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET INVOICE BY REFERENCE (SALE / PURCHASE)
 */
exports.getInvoiceByReference = async (req, res, next) => {
  try {
    const { referenceModel } = req.query;

    if (!referenceModel) {
      return sendResponse(res, 400, false, 'referenceModel is required');
    }

    const invoice = await Invoice.findOne({
      referenceModel,
      referenceId: req.params.referenceId
    }).populate('products.product', 'name');

    if (!invoice) {
      return sendResponse(res, 404, false, 'Invoice not found');
    }

    sendResponse(res, 200, true, 'Invoice fetched successfully', invoice);
  } catch (error) {
    next(error);
  }
};
