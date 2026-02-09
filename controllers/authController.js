const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const sendResponse = require('../utils/response');

/**
 * REGISTER USER (Admin only)
 */
exports.register = async (req, res, next) => {
  try {
    if (req.user.role !== 'Admin') {
      return sendResponse(res, 403, false, 'Only admin can create users');
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return sendResponse(res, 400, false, 'All fields are required');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
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

    sendResponse(res, 201, true, 'User registered successfully', {
      id: user._id,
      name: user.name,
      role: user.role
    });

  } catch (error) {
    next(error);
  }
};

/**
 * LOGIN
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, 400, false, 'Email and password required');
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    sendResponse(res, 200, true, 'Login successful', {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * LOGOUT
 */
exports.logout = async (req, res) => {
  // JWT is stateless → logout handled client-side
  sendResponse(res, 200, true, 'Logout successful');
};

/**
 * GET CURRENT USER
 */
exports.getMe = async (req, res) => {
  sendResponse(res, 200, true, 'User fetched', req.user);
};

/**
 * REFRESH TOKEN
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendResponse(res, 400, false, 'Refresh token required');
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return sendResponse(res, 401, false, 'Invalid refresh token');
    }

    const newAccessToken = generateAccessToken(user);

    sendResponse(res, 200, true, 'Token refreshed', {
      accessToken: newAccessToken
    });

  } catch (error) {
    next(error);
  }
};
