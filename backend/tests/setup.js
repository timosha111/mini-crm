// Выполняется перед каждым тестовым файлом.
// Подгружаем .env.test (override: true — чтобы переменные из рабочего .env/терминала не мешали)
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.test'), override: true });
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
