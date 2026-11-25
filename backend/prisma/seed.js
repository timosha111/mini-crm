// Заполнение БД тестовыми данными. Безопасно запускать повторно:
// пользователи создаются через upsert, демо-данные — только если клиентов ещё нет.
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function upsertUser(name, email, password, role) {
  const hash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { name, email, password: hash, role },
  });
}

async function main() {
  const admin = await upsertUser('Администратор', 'admin@example.com', 'admin123', 'ADMIN');
  const manager = await upsertUser('Иван Менеджеров', 'manager@example.com', 'manager123', 'MANAGER');
  const manager2 = await upsertUser('Мария Петрова', 'manager2@example.com', 'manager123', 'MANAGER');

  if ((await prisma.client.count()) > 0) {
    console.log('Демо-данные уже есть, пропускаю.');
    return;
  }

  const clientsData = [
    { name: 'Алексей Смирнов', phone: '+7 900 111-22-33', email: 'smirnov@example.com', company: 'ООО «Вектор»' },
    { name: 'Ольга Кузнецова', phone: '+7 911 222-33-44', email: 'kuznetsova@example.com', company: 'ИП Кузнецова' },
    { name: 'Дмитрий Орлов', phone: '+7 922 333-44-55', email: 'orlov@example.com', company: 'АО «Прогресс»' },
    { name: 'Елена Волкова', phone: '+7 933 444-55-66', email: 'volkova@example.com', company: 'ООО «Старт»' },
    { name: 'Сергей Попов', phone: '+7 944 555-66-77', email: null, company: null },
  ];
  const clients = [];
  for (const data of clientsData) clients.push(await prisma.client.create({ data }));

  const dealsData = [
    { title: 'Поставка оборудования', amount: 250000, status: 'NEW', c: 0, m: manager },
    { title: 'Разработка сайта', amount: 120000, status: 'IN_PROGRESS', c: 1, m: manager },
    { title: 'Годовое обслуживание', amount: 480000, status: 'SUCCESS', c: 2, m: manager2 },
    { title: 'Консультация по CRM', amount: 30000, status: 'SUCCESS', c: 0, m: manager },
    { title: 'Рекламная кампания', amount: 90000, status: 'LOST', c: 3, m: manager2 },
    { title: 'Обучение сотрудников', amount: 65000, status: 'IN_PROGRESS', c: 3, m: manager2 },
    { title: 'Лицензии на ПО', amount: 150000, status: 'NEW', c: 4, m: admin },
    { title: 'Внедрение учёта склада', amount: 310000, status: 'IN_PROGRESS', c: 2, m: manager },
  ];
  for (const d of dealsData) {
    await prisma.deal.create({
      data: { title: d.title, amount: d.amount, status: d.status, clientId: clients[d.c].id, managerId: d.m.id },
    });
  }

  const notesData = [
    { text: 'Первый звонок прошёл хорошо, клиент просит коммерческое предложение.', c: 0, a: manager },
    { text: 'Договорились о встрече на следующей неделе.', c: 0, a: admin },
    { text: 'Клиент уточнил сроки разработки сайта.', c: 1, a: manager },
    { text: 'Отказался от рекламной кампании из-за бюджета.', c: 3, a: manager2 },
  ];
  for (const n of notesData) {
    await prisma.note.create({ data: { text: n.text, clientId: clients[n.c].id, authorId: n.a.id } });
  }

  console.log('Seed выполнен: пользователи, клиенты, сделки и заметки созданы.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
