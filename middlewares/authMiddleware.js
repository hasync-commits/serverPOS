const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const sendResponse = require('../utils/response');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendResponse(res, 401, false, 'Authorization token missing');
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return sendResponse(res, 401, false, 'User not found');
    }

    req.user = user;
    next();

  } catch (error) {
    return sendResponse(res, 401, false, 'Invalid or expired token');
  }
};
