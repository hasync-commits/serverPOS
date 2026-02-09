const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const {
  createPurchase,
  getPurchases,
  getPurchaseById,
  getPurchaseProducts
} = require('../controllers/purchaseController');

router.use(authMiddleware);

// Admin & Manager
router.post('/', roleMiddleware('Admin', 'Manager'), createPurchase);

// Read-only
router.get('/', getPurchases);
router.get('/:purchaseId', getPurchaseById);
router.get('/:purchaseId/products', getPurchaseProducts);

module.exports = router;
