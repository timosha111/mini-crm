const { app, prisma, request, resetDb, createUser, loginAs } = require('../helpers');

beforeAll(async () => {
  await resetDb();
  await createUser('ADMIN', 'admin@test.com', 'Админ');
});
afterAll(() => prisma.$disconnect());

describe('POST /api/auth/login', () => {
  test('успешный вход возвращает JWT и пользователя без пароля', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'secret123' });
    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.split('.')).toHaveLength(3);
    expect(res.body.user.email).toBe('admin@test.com');
    expect(res.body.user.password).toBeUndefined();
  });
  test('неверный пароль — 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });
  test('пустое тело — 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });
});

describe('защита маршрутов', () => {
  test('GET /api/clients без токена — 401', async () => {
    const res = await request(app).get('/api/clients');
    expect(res.status).toBe(401);
  });
  test('GET /api/auth/me с токеном возвращает текущего пользователя', async () => {
    const token = await loginAs('admin@test.com');
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.role).toBe('ADMIN');
    expect(res.body.password).toBeUndefined();
  });
});
