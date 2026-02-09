const Alert = require('../models/alertModel');
const sendResponse = require('../utils/response');

/**
 * GET ALERTS (WITH FILTERS)
 */
exports.getAlerts = async (req, res, next) => {
  try {
    const {
      type,
      isRead,
      fromDate,
      toDate,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    const alerts = await Alert.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    sendResponse(res, 200, true, 'Alerts fetched successfully', alerts);
  } catch (error) {
    next(error);
  }
};

/**
 * GET ALERT BY ID
 */
exports.getAlertById = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.alertId);

    if (!alert) {
      return sendResponse(res, 404, false, 'Alert not found');
    }

    sendResponse(res, 200, true, 'Alert fetched successfully', alert);
  } catch (error) {
    next(error);
  }
};

/**
 * MARK ALERT AS READ
 */
exports.markAlertRead = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.alertId);

    if (!alert) {
      return sendResponse(res, 404, false, 'Alert not found');
    }

    alert.isRead = true;
    await alert.save();

    sendResponse(res, 200, true, 'Alert marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * MARK ALL ALERTS AS READ
 */
exports.markAllRead = async (req, res, next) => {
  try {
    await Alert.updateMany(
      { isRead: false },
      { $set: { isRead: true } }
    );

    sendResponse(res, 200, true, 'All alerts marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * CREATE ALERT (SYSTEM / INTERNAL)
 */
exports.createAlert = async (req, res, next) => {
  try {
    const { type, message, relatedModel, relatedId } = req.body;

    if (!type || !message) {
      return sendResponse(res, 400, false, 'type and message are required');
    }

    const alert = await Alert.create({
      alertId: `ALT-${Date.now()}`,
      seq: Date.now(), // replace with counter util later
      type,
      message,
      relatedModel,
      relatedId
    });

    sendResponse(res, 201, true, 'Alert created successfully', alert);
  } catch (error) {
    next(error);
  }
};
