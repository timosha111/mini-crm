const { PrismaClient } = require('@prisma/client');

// Единственный экземпляр клиента Prisma на всё приложение
const prisma = new PrismaClient();

module.exports = prisma;
