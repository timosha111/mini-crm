const {
  validateLogin, validateClient, validateDeal, validateStatus, validateUser, validateNote,
} = require('../../src/utils/validators');

describe('validateClient', () => {
  test('корректный клиент проходит проверку', () => {
    expect(validateClient({ name: 'Иван', phone: '+7 900 000-00-00', email: 'a@b.ru' })).toEqual([]);
  });
  test('email необязателен', () => {
    expect(validateClient({ name: 'Иван', phone: '123' })).toEqual([]);
  });
  test('имя и телефон обязательны', () => {
    expect(validateClient({})).toEqual(['Имя клиента обязательно', 'Телефон обязателен']);
  });
  test('некорректный email отклоняется', () => {
    expect(validateClient({ name: 'Иван', phone: '1', email: 'not-an-email' })).toContain('Email имеет неверный формат');
  });
});

describe('validateDeal', () => {
  const ok = { title: 'Сделка', amount: 1000, clientId: 1 };
  test('корректная сделка проходит', () => expect(validateDeal(ok)).toEqual([]));
  test('сумма 0 допустима', () => expect(validateDeal({ ...ok, amount: 0 })).toEqual([]));
  test('отрицательная сумма отклоняется', () => {
    expect(validateDeal({ ...ok, amount: -5 })).toContain('Сумма не может быть отрицательной');
  });
  test('сумма не число', () => {
    expect(validateDeal({ ...ok, amount: 'abc' })).toContain('Сумма должна быть числом');
  });
  test('название и клиент обязательны', () => {
    const errors = validateDeal({ amount: 1 });
    expect(errors).toContain('Название сделки обязательно');
    expect(errors).toContain('Клиент обязателен');
  });
  test('недопустимый статус', () => {
    expect(validateDeal({ ...ok, status: 'WRONG' })).toContain('Недопустимый статус сделки');
  });
});

describe('validateStatus', () => {
  test('допустимые статусы', () => {
    ['NEW', 'IN_PROGRESS', 'SUCCESS', 'LOST'].forEach((s) => expect(validateStatus(s)).toEqual([]));
  });
  test('недопустимый статус', () => expect(validateStatus('DONE')).toHaveLength(1));
});

describe('validateUser', () => {
  const ok = { name: 'Анна', email: 'anna@example.com', role: 'MANAGER', password: 'secret1' };
  test('корректный пользователь', () => expect(validateUser(ok)).toEqual([]));
  test('короткий пароль', () => {
    expect(validateUser({ ...ok, password: '123' })).toContain('Пароль должен содержать минимум 6 символов');
  });
  test('пароль необязателен при редактировании', () => {
    expect(validateUser({ ...ok, password: undefined }, { passwordRequired: false })).toEqual([]);
  });
  test('недопустимая роль', () => {
    expect(validateUser({ ...ok, role: 'ROOT' })).toContain('Роль должна быть ADMIN или MANAGER');
  });
});

describe('validateNote / validateLogin', () => {
  test('пустая заметка отклоняется', () => expect(validateNote({ text: '   ' })).toHaveLength(1));
  test('непустая заметка проходит', () => expect(validateNote({ text: 'Привет' })).toEqual([]));
  test('login требует email и пароль', () => expect(validateLogin({})).toHaveLength(2));
});
