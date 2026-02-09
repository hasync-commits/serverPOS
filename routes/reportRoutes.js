const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const {
  salesReport,
  purchaseReport,
  profitReport,
  productProfitReport,
  stockReport
} = require('../controllers/reportController');

router.use(authMiddleware);

// Reports are read-only (Admin, Manager)
router.get('/sales', roleMiddleware('Admin', 'Manager'), salesReport);
router.get('/purchases', roleMiddleware('Admin', 'Manager'), purchaseReport);
router.get('/profit', roleMiddleware('Admin', 'Manager'), profitReport);
router.get('/product-profit', roleMiddleware('Admin', 'Manager'), productProfitReport);
router.get('/stock', roleMiddleware('Admin', 'Manager'), stockReport);

module.exports = router;
