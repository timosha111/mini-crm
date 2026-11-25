const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { validateLogin } = require('../utils/validators');
const authService = require('../services/authService');

exports.login = asyncHandler(async (req, res) => {
  const errors = validateLogin(req.body);
  if (errors.length) throw new HttpError(400, 'Проверьте введённые данные', errors);
  res.json(await authService.login(req.body.email, req.body.password));
});

exports.me = (req, res) => res.json(req.user);
