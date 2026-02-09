const Supplier = require('../models/supplierModel');
const Purchase = require('../models/purchaseModel');
const sendResponse = require('../utils/response');

/**
 * CREATE SUPPLIER
 */
exports.createSupplier = async (req, res, next) => {
  try {
    const { name, contactNumber, email, address, paymentTerms } = req.body;

    if (!name) {
      return sendResponse(res, 400, false, 'Supplier name is required');
    }

    const supplier = await Supplier.create({
      supplierId: `SUP-${Date.now()}`,
      seq: Date.now(), // replace with counter util later
      name,
      contactNumber,
      email,
      address,
      paymentTerms
    });

    sendResponse(res, 201, true, 'Supplier created successfully', supplier);
  } catch (error) {
    next(error);
  }
};

/**
 * GET SUPPLIERS (LIST WITH FILTERS)
 */
exports.getSuppliers = async (req, res, next) => {
  try {
    const { name, isActive, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const suppliers = await Supplier.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    sendResponse(res, 200, true, 'Suppliers fetched successfully', suppliers);
  } catch (error) {
    next(error);
  }
};

/**
 * GET SUPPLIER BY ID
 */
exports.getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.supplierId);

    if (!supplier) {
      return sendResponse(res, 404, false, 'Supplier not found');
    }

    sendResponse(res, 200, true, 'Supplier fetched successfully', supplier);
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE SUPPLIER
 */
exports.updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.supplierId,
      req.body,
      { new: true }
    );

    if (!supplier) {
      return sendResponse(res, 404, false, 'Supplier not found');
    }

    sendResponse(res, 200, true, 'Supplier updated successfully', supplier);
  } catch (error) {
    next(error);
  }
};

/**
 * ENABLE / DISABLE SUPPLIER
 */
exports.updateSupplierStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (isActive === undefined) {
      return sendResponse(res, 400, false, 'isActive is required');
    }

    const supplier = await Supplier.findById(req.params.supplierId);
    if (!supplier) {
      return sendResponse(res, 404, false, 'Supplier not found');
    }

    supplier.isActive = isActive;
    await supplier.save();

    sendResponse(res, 200, true, 'Supplier status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET PURCHASES BY SUPPLIER
 */
exports.getSupplierPurchases = async (req, res, next) => {
  try {
    const { fromDate, toDate, page = 1, limit = 10 } = req.query;

    const filter = { supplier: req.params.supplierId };

    if (fromDate || toDate) {
      filter.purchaseDate = {};
      if (fromDate) filter.purchaseDate.$gte = new Date(fromDate);
      if (toDate) filter.purchaseDate.$lte = new Date(toDate);
    }

    const purchases = await Purchase.find(filter)
      .populate('supplier', 'name')
      .sort({ purchaseDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    sendResponse(res, 200, true, 'Supplier purchases fetched successfully', purchases);
  } catch (error) {
    next(error);
  }
};
