import { prisma } from "../prisma/client.js";

const includeCategory = { category: { select: { id: true, name: true, icon: true } } };

export function createExpense({ userId, categoryId, amount, paymentMethod, description, date }) {
  return prisma.expense.create({
    data: { userId, categoryId, amount, paymentMethod, description, date },
    include: includeCategory,
  });
}

export function findExpenseById(id) {
  return prisma.expense.findUnique({ where: { id }, include: includeCategory });
}

export function updateExpense(id, data) {
  return prisma.expense.update({ where: { id }, data, include: includeCategory });
}

export function deleteExpense(id) {
  return prisma.expense.delete({ where: { id } });
}

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

export async function findExpenses(userId, filters, { skip, take }) {
  const where = buildWhere(userId, filters);
  const [items, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: includeCategory,
      orderBy: { date: "desc" },
      skip,
      take,
    }),
    prisma.expense.count({ where }),
  ]);
  return { items, total };
}

export async function sumExpense(userId, filters) {
  const where = buildWhere(userId, filters);
  const result = await prisma.expense.aggregate({ where, _sum: { amount: true } });
  return Number(result._sum.amount || 0);
}

/** Powers the "Expense Distribution" pie chart — total spent per category in a date range. */
export async function sumExpenseByCategory(userId, { startDate, endDate } = {}) {
  const where = buildWhere(userId, { startDate, endDate });
  const grouped = await prisma.expense.groupBy({
    by: ["categoryId"],
    where,
    _sum: { amount: true },
  });

  const categoryIds = grouped.map((g) => g.categoryId).filter(Boolean);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true, icon: true },
  });
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return grouped.map((g) => ({
    category: g.categoryId ? categoryMap.get(g.categoryId) || null : null,
    total: Number(g._sum.amount || 0),
  }));
}
