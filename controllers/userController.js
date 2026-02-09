const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const sendResponse = require('../utils/response');

/**
 * CREATE USER
 */
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return sendResponse(res, 400, false, 'All fields are required');
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return sendResponse(res, 409, false, 'User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      userId: `USR-${Date.now()}`,
      seq: Date.now(), // replace with counter util later
      name,
      email,
      password: hashedPassword,
      role
    });

    sendResponse(res, 201, true, 'User created successfully', {
      id: user._id,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET USERS (LIST)
 */
exports.getUsers = async (req, res, next) => {
  try {
    const { role, isActive, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    sendResponse(res, 200, true, 'Users fetched successfully', users);
  } catch (error) {
    next(error);
  }
};

/**
 * GET USER BY ID
 */
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');

    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    sendResponse(res, 200, true, 'User fetched successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE USER BASIC INFO
 */
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;

    const user = await User.findById(req.params.userId);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();

    sendResponse(res, 200, true, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE USER ROLE
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role) {
      return sendResponse(res, 400, false, 'Role is required');
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    user.role = role;
    await user.save();

    sendResponse(res, 200, true, 'User role updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE USER STATUS (ENABLE / DISABLE)
 */
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (isActive === undefined) {
      return sendResponse(res, 400, false, 'isActive is required');
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    user.isActive = isActive;
    await user.save();

    sendResponse(res, 200, true, 'User status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * SOFT DELETE USER
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    user.isActive = false;
    await user.save();

    sendResponse(res, 200, true, 'User deactivated successfully');
  } catch (error) {
    next(error);
  }
};
