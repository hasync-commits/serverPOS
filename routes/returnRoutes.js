const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const {
  createReturn,
  getReturns,
  getReturnById,
  getReturnProducts,
  getReturnsByReference
} = require('../controllers/returnController');

router.use(authMiddleware);

// Create return
router.post(
  '/',
  roleMiddleware('Admin', 'Manager', 'Cashier'),
  createReturn
);

// Read-only
router.get('/', getReturns);
router.get('/:returnId', getReturnById);
router.get('/:returnId/products', getReturnProducts);
router.get('/reference/:referenceId', getReturnsByReference);

module.exports = router;
