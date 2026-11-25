// Запускается перед `npm test` (pretest): применяет миграции к ТЕСТОВОЙ базе.
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

const envFile = path.join(__dirname, '..', '.env.test');
if (!fs.existsSync(envFile)) {
  console.error('\nНе найден backend/.env.test. Скопируйте .env.test.example в .env.test и создайте БД mini_crm_test.\n');
  process.exit(1);
}
require('dotenv').config({ path: envFile, override: true });

const dbName = (process.env.DATABASE_URL || '').split('?')[0].split('/').pop();
if (!dbName.endsWith('_test')) {
  console.error(`\nБаза "${dbName}" не похожа на тестовую (имя должно оканчиваться на _test). Остановлено.\n`);
  process.exit(1);
}

console.log(`Применяю миграции к тестовой БД "${dbName}"...`);
execSync('npx prisma migrate deploy', { stdio: 'inherit', env: process.env, cwd: path.join(__dirname, '..') });
