# Mini CRM

Учебный проект для практики: мини-CRM для учёта клиентов и сделок. Есть вход по JWT, роли ADMIN и MANAGER, клиенты с заметками, сделки с воронкой и dashboard с суммами.

Стек: React + Vite, Node.js + Express, Prisma, PostgreSQL.

## Как запустить

Нужны Node.js 18+ и PostgreSQL 14+.

1. Создать две базы в PostgreSQL:

```sql
CREATE DATABASE mini_crm;
CREATE DATABASE mini_crm_test;
```

2. Backend:

```bash
cd backend
cp .env.example .env
```

В `.env` вписать свой пароль от PostgreSQL:

```
DATABASE_URL="postgresql://postgres:ТВОЙ_ПАРОЛЬ@localhost:5432/mini_crm"
JWT_SECRET="любая_строка"
PORT=5000
```

Дальше:

```bash
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

Сервер будет на http://localhost:5000/api (проверка: `/api/health`).

3. Frontend, в другом терминале:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Открыть http://localhost:5173

## Тесты

```bash
cd backend
cp .env.test.example .env.test   #вписать пароль от PostgreSQL
npm test
```

## Через Docker

```bash
docker compose up --build
```

Сайт на http://localhost:5173, API на http://localhost:5000/api. Остановить: `docker compose down`.

Тесты в Docker:

```bash

docker compose exec db psql -U postgres -c "CREATE DATABASE mini_crm_test;"
docker compose exec backend sh -c "cp .env.test.example .env.test && sed -i 's#^DATABASE_URL=.*#DATABASE_URL=postgresql://postgres:password@db:5432/mini_crm_test#' .env.test"
docker compose exec -e DATABASE_URL="postgresql://postgres:password@db:5432/mini_crm_test" backend npm test
docker compose exec backend npm run test:unit
```

## Архитектура

```
React (SPA) --HTTP/JSON, JWT--> Express API --Prisma--> PostgreSQL
```

Запрос на backend идёт по цепочке: `routes` → `middleware` → `controllers` → `services`.
- `routes` — адреса API.
- `middleware` — `authenticateToken` проверяет JWT, `authorizeRole` проверяет роль.
- `controllers` — валидация и работа с БД.
- `services` — логика входа и подсчёт Dashboard.

