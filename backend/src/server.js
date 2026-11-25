require('dotenv').config();

if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
  console.error('Не заданы JWT_SECRET или DATABASE_URL. Создайте backend/.env по образцу .env.example');
  process.exit(1);
}

const app = require('./app');

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Backend запущен: http://localhost:${port}/api`));
