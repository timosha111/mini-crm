const prisma = require('../utils/prisma');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const parseId = require('../utils/parseId');
const clean = require('../utils/clean');
const { validateNote } = require('../utils/validators');

async function ensureClient(id) {
  const client = await prisma.client.findUnique({ where: { id }, select: { id: true } });
  if (!client) throw new HttpError(404, 'Объект не найден');
}

const authorInclude = { author: { select: { id: true, name: true } } };

exports.listByClient = asyncHandler(async (req, res) => {
  const clientId = parseId(req.params.id);
  await ensureClient(clientId);
  res.json(await prisma.note.findMany({ where: { clientId }, include: authorInclude, orderBy: { createdAt: 'desc' } }));
});

exports.create = asyncHandler(async (req, res) => {
  const clientId = parseId(req.params.id);
  const errors = validateNote(req.body);
  if (errors.length) throw new HttpError(400, 'Проверьте введённые данные', errors);
  await ensureClient(clientId);

  const note = await prisma.note.create({
    data: { text: clean(req.body.text), clientId, authorId: req.user.id },
    include: authorInclude,
  });
  res.status(201).json(note);
});

// Менеджер удаляет только свои заметки, администратор — любые
exports.remove = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note) throw new HttpError(404, 'Объект не найден');
  if (req.user.role !== 'ADMIN' && note.authorId !== req.user.id) {
    throw new HttpError(403, 'Недостаточно прав');
  }
  await prisma.note.delete({ where: { id } });
  res.json({ message: 'Заметка удалена' });
});
