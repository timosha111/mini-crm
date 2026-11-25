const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const HttpError = require('../utils/httpError');

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
}

async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  const passwordOk = user ? await bcrypt.compare(password, user.password) : false;
  if (!passwordOk) throw new HttpError(401, 'Неверный email или пароль');

  const { password: _hash, ...safeUser } = user; // пароль не возвращаем
  return { token: signToken(user), user: safeUser };
}

module.exports = { login, signToken };
