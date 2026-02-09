const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const {
  createSale,
  getSales,
  getSaleById,
  getSaleProducts,
  updateSalePayment
} = require('../controllers/saleController');

router.use(authMiddleware);

// Create sale (Admin, Manager, Cashier)
router.post(
  '/',
  roleMiddleware('Admin', 'Manager', 'Cashier'),
  createSale
);

// Read-only
router.get('/', getSales);
router.get('/:saleId', getSaleById);
router.get('/:saleId/products', getSaleProducts);

// Payment update (optional / future-ready)
router.patch(
  '/:saleId/payment',
  roleMiddleware('Admin', 'Manager'),
  updateSalePayment
);

module.exports = router;
