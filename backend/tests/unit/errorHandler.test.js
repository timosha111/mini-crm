const HttpError = require('../../src/utils/httpError');
const { errorHandler } = require('../../src/middleware/errorHandler');
const { STATUS_TRANSITIONS } = require('../../src/utils/constants');

function run(err) {
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  jest.spyOn(console, 'error').mockImplementation(() => {});
  errorHandler(err, {}, res, () => {});
  return res;
}

describe('errorHandler', () => {
  test('HttpError возвращает свой статус и сообщение', () => {
    const res = run(new HttpError(403, 'Недостаточно прав'));
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Недостаточно прав' });
  });
  test('ошибка Prisma P2002 превращается в 409', () => {
    const res = run({ code: 'P2002', meta: { target: ['email'] } });
    expect(res.status).toHaveBeenCalledWith(409);
  });
  test('неизвестная ошибка — 500 без подробностей', () => {
    const res = run(new Error('секретная причина'));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Ошибка сервера' });
  });
});

describe('воронка продаж', () => {
  test('из NEW нельзя сразу в SUCCESS', () => expect(STATUS_TRANSITIONS.NEW).not.toContain('SUCCESS'));
  test('из IN_PROGRESS можно в SUCCESS и LOST', () => {
    expect(STATUS_TRANSITIONS.IN_PROGRESS).toEqual(['SUCCESS', 'LOST']);
  });
});
