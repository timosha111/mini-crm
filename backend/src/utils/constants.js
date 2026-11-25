const ROLES = ['ADMIN', 'MANAGER'];
const DEAL_STATUSES = ['NEW', 'IN_PROGRESS', 'SUCCESS', 'LOST'];

const STATUS_LABELS = {
  NEW: 'Новая',
  IN_PROGRESS: 'В работе',
  SUCCESS: 'Успешная',
  LOST: 'Потеряна',
};

// Воронка продаж: из какого статуса в какие можно перейти
const STATUS_TRANSITIONS = {
  NEW: ['IN_PROGRESS', 'LOST'],
  IN_PROGRESS: ['SUCCESS', 'LOST'],
  SUCCESS: [],
  LOST: ['NEW'], // сделку можно вернуть в работу
};

module.exports = { ROLES, DEAL_STATUSES, STATUS_LABELS, STATUS_TRANSITIONS };
