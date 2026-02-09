const mongoose = require('mongoose');

module.exports = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  req.session = session;

  try {
    await next();
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
