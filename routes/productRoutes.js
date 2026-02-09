const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  updateProductStatus,
  getLowStockProducts
} = require('../controllers/productController');

// Read-only access for all logged-in users
router.get('/', authMiddleware, getProducts);
router.get('/low-stock', authMiddleware, getLowStockProducts);
router.get('/:productId', authMiddleware, getProductById);

// Write access (Admin, Manager)
router.post('/', authMiddleware, roleMiddleware('Admin', 'Manager'), createProduct);
router.put('/:productId', authMiddleware, roleMiddleware('Admin', 'Manager'), updateProduct);
router.patch('/:productId/status', authMiddleware, roleMiddleware('Admin', 'Manager'), updateProductStatus);

module.exports = router;
