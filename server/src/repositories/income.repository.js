import { prisma } from "../prisma/client.js";

const includeCategory = { category: { select: { id: true, name: true, icon: true } } };

export function createIncome({ userId, categoryId, amount, source, description, date }) {
  return prisma.income.create({
    data: { userId, categoryId, amount, source, description, date },
    include: includeCategory,
  });
}

export function findIncomeById(id) {
  return prisma.income.findUnique({ where: { id }, include: includeCategory });
}

export function updateIncome(id, data) {
  return prisma.income.update({ where: { id }, data, include: includeCategory });
}

export function deleteIncome(id) {
  return prisma.income.delete({ where: { id } });
}

/** Builds the shared where-clause for filtered listing + aggregation. */
function buildWhere(userId, { categoryId, startDate, endDate } = {}) {
  const where = { userId };
  if (categoryId) where.categoryId = categoryId;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = startDate;
    if (endDate) where.date.lt = endDate;
  }
  return where;
}

export async function findIncomes(userId, filters, { skip, take }) {
  const where = buildWhere(userId, filters);
  const [items, total] = await Promise.all([
    prisma.income.findMany({
      where,
      include: includeCategory,
      orderBy: { date: "desc" },
      skip,
      take,
    }),
    prisma.income.count({ where }),
  ]);
  return { items, total };
}

export async function sumIncome(userId, filters) {
  const where = buildWhere(userId, filters);
  const result = await prisma.income.aggregate({ where, _sum: { amount: true } });
  return Number(result._sum.amount || 0);
}
