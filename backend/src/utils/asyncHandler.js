// Оборачивает async-контроллер, чтобы ошибки попадали в errorHandler
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
