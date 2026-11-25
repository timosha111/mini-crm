const HttpError = require('../utils/httpError');

function notFound(req, res, next) {
  next(new HttpError(404, 'Маршрут не найден'));
}

// Единое место обработки ошибок. Stack trace пользователю не отдаётся.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message;
  let details = err.details;

  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Проверьте введённые данные';
    details = ['Некорректный JSON в теле запроса'];
  } else if (err.code === 'P2002') {
    // нарушена уникальность (например, email)
    status = 409;
    message = String(err.meta && err.meta.target).includes('email')
      ? 'Пользователь с таким email уже существует'
      : 'Такая запись уже существует';
  } else if (err.code === 'P2025') {
    status = 404;
    message = 'Объект не найден';
  } else if (err.code === 'P2003') {
    status = 400;
    message = 'Проверьте введённые данные';
    details = ['Указан несуществующий связанный объект'];
  }

  if (status >= 500) {
    console.error(err); // подробности только в консоли сервера
    message = 'Ошибка сервера';
    details = undefined;
  }

  res.status(status).json(details ? { message, details } : { message });
}

module.exports = { notFound, errorHandler };
