const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const {
  getInventoryOverview,
  getInventoryProducts,
  getInventoryProductById,
  getInventoryMovements,
  getLowStockInventory
} = require('../controllers/inventoryController');

router.use(authMiddleware);

// Read-only inventory routes
router.get('/overview', roleMiddleware('Admin', 'Manager'), getInventoryOverview);
router.get('/products', getInventoryProducts);
router.get('/products/:productId', getInventoryProductById);
router.get('/movements', roleMiddleware('Admin', 'Manager'), getInventoryMovements);
router.get('/low-stock', getLowStockInventory);

module.exports = router;
