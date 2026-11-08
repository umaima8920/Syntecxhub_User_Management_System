const bcrypt = require('bcryptjs');
const User = require('../models/User');

const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

const unauthorized = (res) => {
  res.set('WWW-Authenticate', 'Basic realm="User Management API"');
  return res.status(401).json({
    success: false,
    message: 'Authentication required. Send a valid email and password using Basic Auth.',
  });
};

const basicAuth = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');

  if (scheme !== 'Basic' || !encoded) return unauthorized(res);

  const decoded = Buffer.from(encoded, 'base64').toString('utf8');
  const separator = decoded.indexOf(':');
  if (separator === -1) return unauthorized(res);

  const email = decoded.slice(0, separator).trim().toLowerCase();
  const password = decoded.slice(separator + 1);

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH);
    return unauthorized(res);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) return unauthorized(res);

  req.user = user;
  next();
};

module.exports = basicAuth;