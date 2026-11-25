const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const parseId = require('../utils/parseId');
const clean = require('../utils/clean');
const { userSelect } = require('../utils/selects');
const { validateUser } = require('../utils/validators');

const bad = (errors) => new HttpError(400, 'Проверьте введённые данные', errors);

exports.list = asyncHandler(async (req, res) => {
  res.json(await prisma.user.findMany({ select: userSelect, orderBy: { id: 'asc' } }));
});

// Краткий список (id + имя) для выпадающих списков менеджеров. Доступен любому вошедшему.
exports.options = asyncHandler(async (req, res) => {
  res.json(await prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }));
});

exports.create = asyncHandler(async (req, res) => {
  const errors = validateUser(req.body);
  if (errors.length) throw bad(errors);

  const user = await prisma.user.create({
    data: {
      name: clean(req.body.name),
      email: clean(req.body.email).toLowerCase(),
      password: await bcrypt.hash(req.body.password, 10),
      role: req.body.role,
    },
    select: userSelect,
  });
  res.status(201).json(user);
});

exports.update = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const errors = validateUser(req.body, { passwordRequired: false });
  if (errors.length) throw bad(errors);
  if (id === req.user.id && req.body.role !== req.user.role) {
    throw bad(['Нельзя изменить собственную роль']);
  }

  const data = {
    name: clean(req.body.name),
    email: clean(req.body.email).toLowerCase(),
    role: req.body.role,
  };
  if (req.body.password) data.password = await bcrypt.hash(req.body.password, 10);

  res.json(await prisma.user.update({ where: { id }, data, select: userSelect }));
});

exports.remove = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (id === req.user.id) throw bad(['Нельзя удалить самого себя']);
  await prisma.user.delete({ where: { id } });
  res.json({ message: 'Пользователь удалён' });
});
