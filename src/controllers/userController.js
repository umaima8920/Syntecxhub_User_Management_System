const mongoose = require('mongoose');
const User = require('../models/User');

const ALLOWED_FIELDS = ['name', 'email', 'password', 'age'];

const pickAllowed = (body = {}) => {
  const data = {};
  for (const field of ALLOWED_FIELDS) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  return data;
};

const isValidId = (id) => mongoose.isValidObjectId(id);

// CREATE -> POST /api/users (public sign-up)
const createUser = async (req, res) => {
  const user = await User.create(pickAllowed(req.body));
  res.status(201).json({ success: true, message: 'User created successfully', data: user });
};

// READ ALL -> GET /api/users
const getUsers = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, data: users });
};

// READ ONE -> GET /api/users/:id
const getUserById = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ success: false, message: 'Invalid user id' });
  }
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, data: user });
};

// UPDATE -> PUT/PATCH /api/users/:id (own account only)
const updateUser = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ success: false, message: 'Invalid user id' });
  }
  if (id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'You can only update your own account' });
  }

  const updates = pickAllowed(req.body);
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: `Send at least one field to update: ${ALLOWED_FIELDS.join(', ')}`,
    });
  }

  req.user.set(updates);
  await req.user.save();
  res.json({ success: true, message: 'User updated successfully', data: req.user });
};

// DELETE -> DELETE /api/users/:id (own account only)
const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ success: false, message: 'Invalid user id' });
  }
  if (id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'You can only delete your own account' });
  }

  await req.user.deleteOne();
  res.json({ success: true, message: 'User deleted successfully' });
};

module.exports = { createUser, getUsers, getUserById, updateUser, deleteUser };