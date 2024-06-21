const bcrypt = require('bcryptjs');

const hashPassword = async (password) => await bcrypt.hash(password, 10);

const comparePassword = async (password, hashedPassword) => await bcrypt.compare(password, hashedPassword);

module.exports = { hashPassword, comparePassword };