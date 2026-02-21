const mongoose = require('mongoose');
const Sale = require('../models/saleModel');
const Product = require('../models/productModel');
const Counter = require('../models/counterModel');


/* ================= Generate Sale Code ================= */

const generateSaleCode = async () => {

  const counter = await Counter.findOneAndUpdate(
    { name: 'sale' },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );

  const number = counter.sequence.toString().padStart(4, '0');
  return `SAL-${number}`;
};


/* ================= CREATE SALE ================= */

exports.createSale = async (req, res) => {

  try {

    const {
      customerName,
      items,
      subtotal,
      totalDiscount,
      grandTotal,
      paidAmount,
      paymentMethod,
      createdBy
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Sale must contain at least one product'
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

      // Validate stock
      for (let item of items) {

        const product = await Product.findById(item.productId).session(session);

        if (!product) {
          throw new Error(`Product not found`);
        }

        if (product.currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        // Deduct stock
        product.currentStock -= item.quantity;
        await product.save({ session });
      }

      const saleCode = await generateSaleCode();

      const sale = new Sale({
        saleCode,
        customerName,
        items,
        subtotal,
        totalDiscount,
        grandTotal,
        paidAmount,
        isFullyPaid: paidAmount >= grandTotal,
        paymentMethod,
        createdBy
      });

      await sale.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        success: true,
        message: 'Sale created successfully',
        data: sale
      });

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


/* ================= UPDATE SALE ================= */

exports.updateSale = async (req, res) => {

  try {

    const { id } = req.params;
    const updatedData = req.body;

    const existingSale = await Sale.findById(id);

    if (!existingSale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

      // Restore old stock
      for (let item of existingSale.items) {
        const product = await Product.findById(item.productId).session(session);
        product.currentStock += item.quantity;
        await product.save({ session });
      }

      // Validate new stock and deduct
      for (let item of updatedData.items) {

        const product = await Product.findById(item.productId).session(session);

        if (product.currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        product.currentStock -= item.quantity;
        await product.save({ session });
      }

      updatedData.isFullyPaid = updatedData.paidAmount >= updatedData.grandTotal;

      const updatedSale = await Sale.findByIdAndUpdate(
        id,
        updatedData,
        { new: true, session }
      );

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        success: true,
        message: 'Sale updated successfully',
        data: updatedSale
      });

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


/* ================= DELETE SALE ================= */

exports.deleteSale = async (req, res) => {

  try {

    const { id } = req.params;

    const sale = await Sale.findById(id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

      // Restore stock
      for (let item of sale.items) {
        const product = await Product.findById(item.productId).session(session);
        product.currentStock += item.quantity;
        await product.save({ session });
      }

      await Sale.findByIdAndDelete(id, { session });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        success: true,
        message: 'Sale deleted successfully'
      });

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


/* ================= GET ALL SALES ================= */

exports.getAllSales = async (req, res) => {

  try {

    const sales = await Sale.find()
      .populate('items.productId')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: sales
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


/* ================= GET SALE BY ID ================= */

exports.getSaleById = async (req, res) => {

  try {

    const { id } = req.params;

    const sale = await Sale.findById(id)
      .populate('items.productId');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: sale
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};