const bcrypt = require('bcryptjs');
const request = require('supertest');
const prisma = require('../src/utils/prisma');
const app = require('../src/app');

// Защита: тесты очищают таблицы, поэтому работают ТОЛЬКО с БД, имя которой заканчивается на _test
function assertTestDatabase() {
  const url = process.env.DATABASE_URL || '';
  const dbName = url.split('?')[0].split('/').pop();
  if (!dbName.endsWith('_test')) {
    throw new Error(
      `Интеграционные тесты запрещены для БД "${dbName}". Создайте backend/.env.test с базой mini_crm_test.`
    );
  }
}

async function resetDb() {
  assertTestDatabase();
  await prisma.note.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
}

async function createUser(role, email, name = 'Тестовый пользователь') {
  return prisma.user.create({
    data: { name, email, role, password: await bcrypt.hash('secret123', 4) },
  });
}

// Логинится через настоящий API и возвращает JWT
async function loginAs(email) {
  const res = await request(app).post('/api/auth/login').send({ email, password: 'secret123' });
  return res.body.token;
}

module.exports = { app, prisma, request, resetDb, createUser, loginAs, assertTestDatabase };
