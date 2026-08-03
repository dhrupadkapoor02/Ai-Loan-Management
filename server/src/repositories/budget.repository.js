import { prisma } from "../prisma/client.js";

const includeCategory = { category: { select: { id: true, name: true, icon: true } } };

export function findBudget(userId, categoryId, month, year) {
  return prisma.budget.findUnique({
    where: { userId_categoryId_month_year: { userId, categoryId, month, year } },
  });
}

export function upsertBudget({ userId, categoryId, amount, month, year }) {
  return prisma.budget.upsert({
    where: { userId_categoryId_month_year: { userId, categoryId, month, year } },
    update: { amount },
    create: { userId, categoryId, amount, month, year },
    include: includeCategory,
  });
}

export function findBudgetById(id) {
  return prisma.budget.findUnique({ where: { id }, include: includeCategory });
}

export function deleteBudget(id) {
  return prisma.budget.delete({ where: { id } });
}

export function findBudgetsForMonth(userId, month, year) {
  return prisma.budget.findMany({
    where: { userId, month, year },
    include: includeCategory,
    orderBy: { createdAt: "asc" },
  });
}
