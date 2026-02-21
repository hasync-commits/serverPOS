const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/allProducts', productController.getAllProducts);
router.get('/availableProducts', productController.getAvailableProducts);
router.get('/lowStock', productController.getLowStockProducts);
router.get('/product/:id', productController.getProductById);

module.exports = router;