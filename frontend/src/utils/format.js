export const STATUS_ORDER = ['NEW', 'IN_PROGRESS', 'SUCCESS', 'LOST'];

export const STATUS_LABELS = {
  NEW: 'Новая',
  IN_PROGRESS: 'В работе',
  SUCCESS: 'Успешная',
  LOST: 'Потеряна',
};

// Воронка: в какие статусы можно перевести сделку (то же правило есть на backend)
export const STATUS_TRANSITIONS = {
  NEW: ['IN_PROGRESS', 'LOST'],
  IN_PROGRESS: ['SUCCESS', 'LOST'],
  SUCCESS: [],
  LOST: ['NEW'],
};

export const ROLE_LABELS = { ADMIN: 'Администратор', MANAGER: 'Менеджер' };

export const formatMoney = (n) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n || 0);

export const formatDate = (d) =>
  new Date(d).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' });
