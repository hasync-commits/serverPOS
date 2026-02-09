const sendResponse = require('../utils/response');

module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return sendResponse(res, 403, false, 'Access denied');
    }
    next();
  };
};
