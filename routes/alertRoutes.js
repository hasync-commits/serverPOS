const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const {
  getAlerts,
  getAlertById,
  markAlertRead,
  markAllRead,
  createAlert
} = require('../controllers/alertController');

router.use(authMiddleware);

// Read alerts
router.get('/', getAlerts);
router.get('/:alertId', getAlertById);

// Mark read
router.patch('/:alertId/read', markAlertRead);
router.patch('/read-all', markAllRead);

// Internal / system alert creation (Admin only or internal use)
router.post('/', roleMiddleware('Admin', 'Manager'), createAlert);

module.exports = router;
