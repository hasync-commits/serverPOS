const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  printInvoice,
  getInvoiceByReference
} = require('../controllers/invoiceController');

router.use(authMiddleware);

// Create invoice (Admin, Manager)
router.post('/', roleMiddleware('Admin', 'Manager'), createInvoice);

// Read-only
router.get('/', getInvoices);
router.get('/:invoiceId', getInvoiceById);
router.get('/:invoiceId/print', printInvoice);
router.get('/reference/:referenceId', getInvoiceByReference);

module.exports = router;
