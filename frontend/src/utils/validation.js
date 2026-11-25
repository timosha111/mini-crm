// Проверки на клиенте — те же правила, что и на backend. Возвращают массив сообщений.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const blank = (v) => !v || String(v).trim() === '';

export function validateLogin(f) {
  const errors = [];
  if (blank(f.email) || !EMAIL_RE.test(f.email.trim())) errors.push('Введите корректный email');
  if (blank(f.password)) errors.push('Введите пароль');
  return errors;
}

export function validateClient(f) {
  const errors = [];
  if (blank(f.name)) errors.push('Имя клиента обязательно');
  if (blank(f.phone)) errors.push('Телефон обязателен');
  if (!blank(f.email) && !EMAIL_RE.test(f.email.trim())) errors.push('Email имеет неверный формат');
  return errors;
}

export function validateDeal(f) {
  const errors = [];
  if (blank(f.title)) errors.push('Название сделки обязательно');
  if (f.amount === '' || Number.isNaN(Number(f.amount))) errors.push('Сумма должна быть числом');
  else if (Number(f.amount) < 0) errors.push('Сумма не может быть отрицательной');
  if (!f.clientId) errors.push('Выберите клиента');
  return errors;
}

export function validateUser(f, { passwordRequired }) {
  const errors = [];
  if (blank(f.name)) errors.push('Имя обязательно');
  if (blank(f.email) || !EMAIL_RE.test(f.email.trim())) errors.push('Введите корректный email');
  if (!['ADMIN', 'MANAGER'].includes(f.role)) errors.push('Выберите роль');
  if ((passwordRequired || f.password) && (f.password || '').length < 6) {
    errors.push('Пароль должен содержать минимум 6 символов');
  }
  return errors;
}

export const validateNote = (text) => (blank(text) ? ['Текст заметки не может быть пустым'] : []);
