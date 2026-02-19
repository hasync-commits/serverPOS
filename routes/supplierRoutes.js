const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

// CREATE SUPPLIER
router.post('/', supplierController.createSupplier);

// GET ALL (with filters)
router.get('/', supplierController.getSuppliers);

// GET BY ID
router.get('/:id', supplierController.getSupplierById);

// UPDATE
router.put('/:id', supplierController.updateSupplier);

// DELETE
router.delete('/:id', supplierController.deleteSupplier);

// TOGGLE ACTIVE STATUS
router.patch('/:id/status', supplierController.toggleSupplierStatus);

module.exports = router;
