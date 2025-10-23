const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.hashPassword = async (plaintext) => bcrypt.hash(plaintext, 12);
exports.comparePassword = async (plaintext, hash) => bcrypt.compare(plaintext, hash);

exports.generateAccessToken = user => 
  jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

exports.generateRefreshToken = user => 
  jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

exports.verifyRefreshToken = (token, callback) => {
  jwt.verify(token, process.env.JWT_REFRESH_SECRET, callback);
};
