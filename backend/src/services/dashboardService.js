const prisma = require('../utils/prisma');
const { DEAL_STATUSES } = require('../utils/constants');

// Все подсчёты выполняет PostgreSQL (COUNT / SUM / GROUP BY), а не JavaScript
async function getDashboard() {
  const [clients, totals, grouped] = await Promise.all([
    prisma.client.count(),
    prisma.deal.aggregate({ _count: { _all: true }, _sum: { amount: true } }),
    prisma.deal.groupBy({ by: ['status'], _count: { _all: true }, _sum: { amount: true } }),
  ]);

  // Заполняем нулями статусы, по которым сделок ещё нет
  const byStatus = {};
  DEAL_STATUSES.forEach((s) => {
    byStatus[s] = { count: 0, amount: 0 };
  });
  grouped.forEach((g) => {
    byStatus[g.status] = { count: g._count._all, amount: g._sum.amount || 0 };
  });

  return {
    clients,
    deals: { count: totals._count._all, totalAmount: totals._sum.amount || 0 },
    byStatus,
  };
}

module.exports = { getDashboard };
