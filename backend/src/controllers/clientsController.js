const prisma = require('../utils/prisma');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const parseId = require('../utils/parseId');
const clean = require('../utils/clean');
const { validateClient } = require('../utils/validators');

function checked(body) {
  const errors = validateClient(body);
  if (errors.length) throw new HttpError(400, 'Проверьте введённые данные', errors);
  return {
    name: clean(body.name),
    phone: clean(body.phone),
    email: clean(body.email) || null,
    company: clean(body.company) || null,
  };
}

// GET /api/clients?search=...  — поиск по имени, телефону, email и компании
exports.list = asyncHandler(async (req, res) => {
  const search = clean(req.query.search);
  const where = search
    ? { OR: ['name', 'phone', 'email', 'company'].map((f) => ({ [f]: { contains: search, mode: 'insensitive' } })) }
    : {};
  const clients = await prisma.client.findMany({
    where,
    orderBy: { id: 'desc' },
    include: { _count: { select: { deals: true, notes: true } } },
  });
  res.json(clients);
});

exports.getOne = asyncHandler(async (req, res) => {
  const client = await prisma.client.findUnique({
    where: { id: parseId(req.params.id) },
    include: {
      deals: { orderBy: { createdAt: 'desc' }, include: { manager: { select: { id: true, name: true } } } },
      notes: { orderBy: { createdAt: 'desc' }, include: { author: { select: { id: true, name: true } } } },
    },
  });
  if (!client) throw new HttpError(404, 'Объект не найден');
  res.json(client);
});

exports.create = asyncHandler(async (req, res) => {
  res.status(201).json(await prisma.client.create({ data: checked(req.body) }));
});

exports.update = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  res.json(await prisma.client.update({ where: { id }, data: checked(req.body) }));
});

exports.remove = asyncHandler(async (req, res) => {
  await prisma.client.delete({ where: { id: parseId(req.params.id) } });
  res.json({ message: 'Клиент удалён' });
});
