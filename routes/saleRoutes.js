const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');

router.post('/newSale', saleController.createSale);
router.put('/updateSale/:id', saleController.updateSale);
router.delete('/deleteSale/:id', saleController.deleteSale);

router.get('/allSales', saleController.getAllSales);
router.get('/sale/:id', saleController.getSaleById);

module.exports = router;