const { app, prisma, request, resetDb, createUser, loginAs } = require('../helpers');

let adminToken;
let managerToken;

beforeAll(async () => {
  await resetDb();
  await createUser('ADMIN', 'admin@test.com', 'Админ');
  await createUser('MANAGER', 'manager@test.com', 'Менеджер');
  adminToken = await loginAs('admin@test.com');
  managerToken = await loginAs('manager@test.com');
});
afterAll(() => prisma.$disconnect());

const auth = (t) => ({ Authorization: `Bearer ${t}` });

describe('права MANAGER', () => {
  test('менеджер может создать клиента (201)', async () => {
    const res = await request(app).post('/api/clients').set(auth(managerToken))
      .send({ name: 'Клиент', phone: '+7 900 000-00-00', email: 'c@example.com' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Клиент');
  });
  test('невалидный клиент — 400 с описанием ошибок', async () => {
    const res = await request(app).post('/api/clients').set(auth(managerToken)).send({ name: '', phone: '' });
    expect(res.status).toBe(400);
    expect(res.body.details.length).toBeGreaterThan(0);
  });
  test('менеджер не может получить список пользователей (403)', async () => {
    const res = await request(app).get('/api/users').set(auth(managerToken));
    expect(res.status).toBe(403);
  });
  test('менеджер не может создать пользователя (403)', async () => {
    const res = await request(app).post('/api/users').set(auth(managerToken))
      .send({ name: 'X', email: 'x@example.com', role: 'ADMIN', password: '123456' });
    expect(res.status).toBe(403);
  });
  test('менеджер не может удалить клиента (403)', async () => {
    const client = await prisma.client.create({ data: { name: 'Удаляемый', phone: '1' } });
    const res = await request(app).delete(`/api/clients/${client.id}`).set(auth(managerToken));
    expect(res.status).toBe(403);
  });
});

describe('права ADMIN', () => {
  test('админ получает список пользователей без паролей', async () => {
    const res = await request(app).get('/api/users').set(auth(adminToken));
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    res.body.forEach((u) => expect(u.password).toBeUndefined());
  });
  test('админ создаёт пользователя; повторный email — 409', async () => {
    const body = { name: 'Новый', email: 'new@example.com', role: 'MANAGER', password: 'secret1' };
    const first = await request(app).post('/api/users').set(auth(adminToken)).send(body);
    expect(first.status).toBe(201);
    const second = await request(app).post('/api/users').set(auth(adminToken)).send(body);
    expect(second.status).toBe(409);
  });
  test('админ удаляет клиента (200), повторно — 404', async () => {
    const client = await prisma.client.create({ data: { name: 'Для удаления', phone: '1' } });
    const ok = await request(app).delete(`/api/clients/${client.id}`).set(auth(adminToken));
    expect(ok.status).toBe(200);
    const again = await request(app).delete(`/api/clients/${client.id}`).set(auth(adminToken));
    expect(again.status).toBe(404);
  });
});

describe('заметки', () => {
  test('менеджер не может удалить чужую заметку, админ — может', async () => {
    const client = await prisma.client.create({ data: { name: 'С заметкой', phone: '1' } });
    const created = await request(app).post(`/api/clients/${client.id}/notes`).set(auth(adminToken)).send({ text: 'Заметка админа' });
    expect(created.status).toBe(201);

    const forbidden = await request(app).delete(`/api/notes/${created.body.id}`).set(auth(managerToken));
    expect(forbidden.status).toBe(403);
    const allowed = await request(app).delete(`/api/notes/${created.body.id}`).set(auth(adminToken));
    expect(allowed.status).toBe(200);
  });
  test('пустая заметка — 400', async () => {
    const client = await prisma.client.create({ data: { name: 'Пустая', phone: '1' } });
    const res = await request(app).post(`/api/clients/${client.id}/notes`).set(auth(managerToken)).send({ text: '  ' });
    expect(res.status).toBe(400);
  });
});
