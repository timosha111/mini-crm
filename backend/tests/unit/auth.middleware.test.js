const jwt = require('jsonwebtoken');

// Подменяем Prisma, чтобы unit-тест не обращался к базе данных
jest.mock('../../src/utils/prisma', () => ({ user: { findUnique: jest.fn() } }));
const prisma = require('../../src/utils/prisma');
const { authenticateToken, authorizeRole } = require('../../src/middleware/auth');

beforeAll(() => {
  process.env.JWT_SECRET = 'unit_secret';
});

describe('authorizeRole', () => {
  test('пропускает разрешённую роль', () => {
    const next = jest.fn();
    authorizeRole('ADMIN')({ user: { role: 'ADMIN' } }, {}, next);
    expect(next).toHaveBeenCalledWith();
  });
  test('запрещает другую роль (403)', () => {
    const next = jest.fn();
    authorizeRole('ADMIN')({ user: { role: 'MANAGER' } }, {}, next);
    expect(next.mock.calls[0][0].status).toBe(403);
  });
});

describe('authenticateToken', () => {
  test('без заголовка — 401', async () => {
    const next = jest.fn();
    await authenticateToken({ headers: {} }, {}, next);
    expect(next.mock.calls[0][0].status).toBe(401);
  });
  test('неверный токен — 401', async () => {
    const next = jest.fn();
    await authenticateToken({ headers: { authorization: 'Bearer broken' } }, {}, next);
    expect(next.mock.calls[0][0].status).toBe(401);
  });
  test('верный токен — пользователь попадает в req.user', async () => {
    const user = { id: 7, role: 'MANAGER' };
    prisma.user.findUnique.mockResolvedValue(user);
    const token = jwt.sign({ id: 7, role: 'MANAGER' }, 'unit_secret');
    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();
    await authenticateToken(req, {}, next);
    expect(req.user).toEqual(user);
    expect(next).toHaveBeenCalledWith();
  });
  test('токен удалённого пользователя — 401', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const token = jwt.sign({ id: 99, role: 'ADMIN' }, 'unit_secret');
    const next = jest.fn();
    await authenticateToken({ headers: { authorization: `Bearer ${token}` } }, {}, next);
    expect(next.mock.calls[0][0].status).toBe(401);
  });
});
