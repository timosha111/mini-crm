// Функции валидации возвращают МАССИВ сообщений об ошибках (пустой массив = всё хорошо)
const { ROLES, DEAL_STATUSES } = require('./constants');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isBlank = (v) => typeof v !== 'string' || v.trim() === '';
const isPositiveInt = (v) => v !== '' && v !== null && v !== undefined && Number.isInteger(Number(v)) && Number(v) > 0;

function validateLogin(body = {}) {
  const errors = [];
  if (isBlank(body.email) || !EMAIL_RE.test(body.email.trim())) errors.push('Введите корректный email');
  if (isBlank(body.password)) errors.push('Введите пароль');
  return errors;
}

function validateClient(body = {}) {
  const errors = [];
  if (isBlank(body.name)) errors.push('Имя клиента обязательно');
  if (isBlank(body.phone)) errors.push('Телефон обязателен');
  if (!isBlank(body.email) && !EMAIL_RE.test(body.email.trim())) errors.push('Email имеет неверный формат');
  return errors;
}

function validateStatus(status) {
  return DEAL_STATUSES.includes(status) ? [] : ['Недопустимый статус сделки'];
}

function validateDeal(body = {}) {
  const errors = [];
  if (isBlank(body.title)) errors.push('Название сделки обязательно');

  const emptyAmount = body.amount === '' || body.amount === null || body.amount === undefined;
  const amount = Number(body.amount);
  if (emptyAmount || typeof body.amount === 'boolean' || Number.isNaN(amount)) {
    errors.push('Сумма должна быть числом');
  } else if (amount < 0) {
    errors.push('Сумма не может быть отрицательной');
  }

  if (!isPositiveInt(body.clientId)) errors.push('Клиент обязателен');
  if (body.status !== undefined) errors.push(...validateStatus(body.status));
  const hasManager = body.managerId !== undefined && body.managerId !== null && body.managerId !== '';
  if (hasManager && !isPositiveInt(body.managerId)) errors.push('Некорректный менеджер');
  return errors;
}

function validateUser(body = {}, { passwordRequired = true } = {}) {
  const errors = [];
  if (isBlank(body.name)) errors.push('Имя обязательно');
  if (isBlank(body.email) || !EMAIL_RE.test(body.email.trim())) errors.push('Введите корректный email');
  if (!ROLES.includes(body.role)) errors.push('Роль должна быть ADMIN или MANAGER');

  const hasPassword = typeof body.password === 'string' && body.password !== '';
  if (passwordRequired || hasPassword) {
    if (typeof body.password !== 'string' || body.password.length < 6) {
      errors.push('Пароль должен содержать минимум 6 символов');
    }
  }
  return errors;
}

function validateNote(body = {}) {
  return isBlank(body.text) ? ['Текст заметки не может быть пустым'] : [];
}

module.exports = { validateLogin, validateClient, validateDeal, validateStatus, validateUser, validateNote };
