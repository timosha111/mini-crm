const HttpError = require('./httpError');

// Превращает параметр из URL в положительное целое число или бросает 400
module.exports = function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new HttpError(400, 'Некорректный идентификатор');
  }
  return id;
};
