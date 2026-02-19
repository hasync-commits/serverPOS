const Supplier = require('../models/supplierModel');
const Counter = require('../models/counterModel');
const mongoose = require('mongoose');


// ==================================================
// CREATE SUPPLIER
// ==================================================
exports.createSupplier = async (req, res) => {
  try {

    const { name, phone, createdBy } = req.body;

    // Basic validation
    if (!name || !phone || !createdBy) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone and createdBy are required'
      });
    }

    // 🔥 Atomic counter increment
    const counter = await Counter.findOneAndUpdate(
      { name: 'supplierCode' },
      { $inc: { sequence: 1 } },
      { new: true, upsert: true }
    );

    const generatedCode = `SUP-${String(counter.sequence).padStart(4, '0')}`;

    const supplier = new Supplier({
      ...req.body,
      code: generatedCode
    });

    const savedSupplier = await supplier.save();

    return res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: savedSupplier
    });

  } catch (error) {

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate supplier code'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


// ==================================================
// GET ALL SUPPLIERS (WITH FILTERING)
// ==================================================
exports.getSuppliers = async (req, res) => {
  try {

    const { from, to, period, isActive } = req.query;

    let filter = {};

    // Filter by active status
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Custom date range
    if (from && to) {
      filter.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    }

    // Predefined period filter
    if (period) {
      const now = new Date();
      let startDate;

      if (period === 'week') {
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
      }

      if (period === 'month') {
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
      }

      if (period === 'year') {
        startDate = new Date();
        startDate.setFullYear(now.getFullYear() - 1);
      }

      if (startDate) {
        filter.createdAt = { $gte: startDate };
      }
    }

    const suppliers = await Supplier.find(filter)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch suppliers',
      error: error.message
    });
  }
};


// ==================================================
// GET SUPPLIER BY ID
// ==================================================
exports.getSupplierById = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid supplier ID'
      });
    }

    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: supplier
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch supplier',
      error: error.message
    });
  }
};


// ==================================================
// UPDATE SUPPLIER
// ==================================================
exports.updateSupplier = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid supplier ID'
      });
    }

    // Prevent updating code manually
    delete req.body.code;

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedSupplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      data: updatedSupplier
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update supplier',
      error: error.message
    });
  }
};


// ==================================================
// DELETE SUPPLIER
// ==================================================
exports.deleteSupplier = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid supplier ID'
      });
    }

    const deletedSupplier = await Supplier.findByIdAndDelete(id);

    if (!deletedSupplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete supplier',
      error: error.message
    });
  }
};


// ==================================================
// TOGGLE ACTIVE / INACTIVE
// ==================================================
exports.toggleSupplierStatus = async (req, res) => {
  try {

    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid supplier ID'
      });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be boolean'
      });
    }

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updatedSupplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Supplier status updated successfully',
      data: updatedSupplier
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update supplier status',
      error: error.message
    });
  }
};
