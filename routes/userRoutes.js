const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserRole,
  updateUserStatus,
  deleteUser
} = require('../controllers/userController');

router.use(authMiddleware);
router.use(roleMiddleware('Admin'));

router.post('/', createUser);
router.get('/', getUsers);
router.get('/:userId', getUserById);
router.put('/:userId', updateUser);
router.patch('/:userId/role', updateUserRole);
router.patch('/:userId/status', updateUserStatus);
router.delete('/:userId', deleteUser);

module.exports = router;
