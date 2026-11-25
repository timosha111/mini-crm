const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const HttpError = require('../utils/httpError');
const { userSelect } = require('../utils/selects');

// Проверяет JWT из заголовка "Authorization: Bearer <token>" и кладёт пользователя в req.user
async function authenticateToken(req, res, next) {
  try {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) throw new HttpError(401, 'Необходимо войти в систему');

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      throw new HttpError(401, 'Необходимо войти в систему');
    }

    // Берём пользователя из БД: так удалённый пользователь сразу теряет доступ
    const user = await prisma.user.findUnique({ where: { id: payload.id }, select: userSelect });
    if (!user) throw new HttpError(401, 'Необходимо войти в систему');

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

// Пропускает только пользователей с одной из указанных ролей: authorizeRole('ADMIN')
function authorizeRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new HttpError(403, 'Недостаточно прав'));
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRole };
