const express = require('express');
const basicAuth = require('../middleware/auth');
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

router.post('/', createUser); // public

router.get('/', basicAuth, getUsers); // protected
router
  .route('/:id')
  .get(basicAuth, getUserById)
  .put(basicAuth, updateUser)
  .patch(basicAuth, updateUser)
  .delete(basicAuth, deleteUser);

module.exports = router;