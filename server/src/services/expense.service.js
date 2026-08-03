import * as expenseRepo from "../repositories/expense.repository.js";
import { assertUsableCategory } from "./category.service.js";
import { serializeDecimals, serializeDecimalsList } from "../utils/serialize.js";
import { buildPaginationMeta } from "../utils/pagination.js";
import { ApiError } from "../utils/ApiError.js";

async function getOwnedExpense(userId, id) {
  const expense = await expenseRepo.findExpenseById(id);
  if (!expense) throw ApiError.notFound("Expense not found");
  if (expense.userId !== userId) throw ApiError.forbidden("You do not have access to this expense record");
  return expense;
}

export async function createExpense(userId, { categoryId, amount, paymentMethod, description, date }) {
  await assertUsableCategory(userId, categoryId, "EXPENSE");
  const expense = await expenseRepo.createExpense({
    userId,
    categoryId: categoryId || null,
    amount,
    paymentMethod,
    description,
    date: new Date(date),
  });
  return serializeDecimals(expense, ["amount"]);
}

export async function listExpenses(userId, filters, pagination) {
  const { items, total } = await expenseRepo.findExpenses(userId, filters, pagination);
  return {
    items: serializeDecimalsList(items, ["amount"]),
    meta: buildPaginationMeta({ page: pagination.page, limit: pagination.limit, total }),
  };
}

export async function updateExpense(userId, id, data) {
  await getOwnedExpense(userId, id);
  if (data.categoryId !== undefined) {
    await assertUsableCategory(userId, data.categoryId, "EXPENSE");
  }
  const updateData = { ...data };
  if (updateData.date) updateData.date = new Date(updateData.date);

  const updated = await expenseRepo.updateExpense(id, updateData);
  return serializeDecimals(updated, ["amount"]);
}

export async function deleteExpense(userId, id) {
  await getOwnedExpense(userId, id);
  await expenseRepo.deleteExpense(id);
}
