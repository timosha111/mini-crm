const { app, prisma, request, resetDb, createUser, loginAs } = require('../helpers');

let token;
let clientId;

beforeAll(async () => {
  await resetDb();
  await createUser('MANAGER', 'manager@test.com', 'Менеджер');
  token = await loginAs('manager@test.com');
  clientId = (await prisma.client.create({ data: { name: 'Клиент', phone: '1' } })).id;
});
afterAll(() => prisma.$disconnect());

const auth = () => ({ Authorization: `Bearer ${token}` });
const createDeal = (title, amount) =>
  request(app).post('/api/deals').set(auth()).send({ title, amount, clientId });

describe('сделки и воронка', () => {
  test('создание сделки: статус NEW, менеджер — автор', async () => {
    const res = await createDeal('Сделка 1', 1000);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('NEW');
    expect(res.body.manager.name).toBe('Менеджер');
  });
  test('отрицательная сумма — 400', async () => {
    const res = await createDeal('Плохая', -10);
    expect(res.status).toBe(400);
  });
  test('допустимый переход NEW → IN_PROGRESS', async () => {
    const deal = (await createDeal('Сделка 2', 2000)).body;
    const res = await request(app).patch(`/api/deals/${deal.id}/status`).set(auth()).send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('IN_PROGRESS');
  });
  test('недопустимый переход NEW → SUCCESS — 400', async () => {
    const deal = (await createDeal('Сделка 3', 3000)).body;
    const res = await request(app).patch(`/api/deals/${deal.id}/status`).set(auth()).send({ status: 'SUCCESS' });
    expect(res.status).toBe(400);
  });
  test('поиск по названию и фильтр по статусу', async () => {
    const found = await request(app).get('/api/deals?search=Сделка 2').set(auth());
    expect(found.body.map((d) => d.title)).toEqual(['Сделка 2']);
    const filtered = await request(app).get('/api/deals?status=IN_PROGRESS').set(auth());
    expect(filtered.body.every((d) => d.status === 'IN_PROGRESS')).toBe(true);
  });
});

describe('GET /api/dashboard (агрегаты)', () => {
  test('суммы и количества считаются в БД', async () => {
    // К этому моменту: Сделка 1 (NEW, 1000), Сделка 2 (IN_PROGRESS, 2000), Сделка 3 (NEW, 3000)
    const res = await request(app).get('/api/dashboard').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.clients).toBe(1);
    expect(res.body.deals.count).toBe(3);
    expect(res.body.deals.totalAmount).toBe(6000);
    expect(res.body.byStatus.NEW).toEqual({ count: 2, amount: 4000 });
    expect(res.body.byStatus.IN_PROGRESS).toEqual({ count: 1, amount: 2000 });
    expect(res.body.byStatus.SUCCESS).toEqual({ count: 0, amount: 0 });
    expect(res.body.byStatus.LOST).toEqual({ count: 0, amount: 0 });
  });
  test('без токена — 401', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(401);
  });
});
