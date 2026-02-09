const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  updateSupplierStatus,
  getSupplierPurchases
} = require('../controllers/supplierController');

// All routes require authentication
router.use(authMiddleware);

// Read access (Admin, Manager, Cashier)
router.get('/', getSuppliers);
router.get('/:supplierId', getSupplierById);
router.get('/:supplierId/purchases', getSupplierPurchases);

// Write access (Admin, Manager)
router.post('/', roleMiddleware('Admin', 'Manager'), createSupplier);
router.put('/:supplierId', roleMiddleware('Admin', 'Manager'), updateSupplier);
router.patch('/:supplierId/status', roleMiddleware('Admin', 'Manager'), updateSupplierStatus);

module.exports = router;
