// Поля пользователя, которые можно отдавать наружу. Пароля здесь НЕТ специально.
const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

module.exports = { userSelect };
