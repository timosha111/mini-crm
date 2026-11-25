const prisma = require('../utils/prisma');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const parseId = require('../utils/parseId');
const clean = require('../utils/clean');
const { DEAL_STATUSES, STATUS_LABELS, STATUS_TRANSITIONS } = require('../utils/constants');
const { validateDeal, validateStatus } = require('../utils/validators');

const include = {
  client: { select: { id: true, name: true } },
  manager: { select: { id: true, name: true } },
};

const bad = (errors) => new HttpError(400, 'Проверьте введённые данные', errors);
const toManagerId = (v) => (v === undefined || v === null || v === '' ? null : Number(v));

// GET /api/deals?search=&status=&managerId=&clientId=
exports.list = asyncHandler(async (req, res) => {
  const where = {};
  const search = clean(req.query.search);
  if (search) where.title = { contains: search, mode: 'insensitive' };
  if (req.query.status) {
    if (!DEAL_STATUSES.includes(req.query.status)) throw bad(['Недопустимый статус сделки']);
    where.status = req.query.status;
  }
  if (req.query.managerId) where.managerId = parseId(req.query.managerId);
  if (req.query.clientId) where.clientId = parseId(req.query.clientId);

  res.json(await prisma.deal.findMany({ where, include, orderBy: { id: 'desc' } }));
});

exports.getOne = asyncHandler(async (req, res) => {
  const deal = await prisma.deal.findUnique({ where: { id: parseId(req.params.id) }, include });
  if (!deal) throw new HttpError(404, 'Объект не найден');
  res.json(deal);
});

exports.create = asyncHandler(async (req, res) => {
  const errors = validateDeal(req.body);
  if (errors.length) throw bad(errors);

  const deal = await prisma.deal.create({
    data: {
      title: clean(req.body.title),
      amount: Number(req.body.amount),
      status: req.body.status || 'NEW',
      clientId: Number(req.body.clientId),
      // если менеджер не указан — сделку ведёт тот, кто её создал
      managerId: req.body.managerId === undefined ? req.user.id : toManagerId(req.body.managerId),
    },
    include,
  });
  res.status(201).json(deal);
});

// Статус здесь НЕ меняется — для этого есть PATCH /:id/status (воронка)
exports.update = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const errors = validateDeal(req.body);
  if (errors.length) throw bad(errors);

  const data = {
    title: clean(req.body.title),
    amount: Number(req.body.amount),
    clientId: Number(req.body.clientId),
  };
  if (req.body.managerId !== undefined) data.managerId = toManagerId(req.body.managerId);

  res.json(await prisma.deal.update({ where: { id }, data, include }));
});

exports.changeStatus = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const { status } = req.body || {};
  const errors = validateStatus(status);
  if (errors.length) throw bad(errors);

  const deal = await prisma.deal.findUnique({ where: { id } });
  if (!deal) throw new HttpError(404, 'Объект не найден');

  if (!STATUS_TRANSITIONS[deal.status].includes(status)) {
    throw bad([`Нельзя перевести сделку из статуса «${STATUS_LABELS[deal.status]}» в «${STATUS_LABELS[status]}»`]);
  }
  res.json(await prisma.deal.update({ where: { id }, data: { status }, include }));
});

exports.remove = asyncHandler(async (req, res) => {
  await prisma.deal.delete({ where: { id: parseId(req.params.id) } });
  res.json({ message: 'Сделка удалена' });
});
