import * as incomeRepo from "../repositories/income.repository.js";
import { assertUsableCategory } from "./category.service.js";
import { serializeDecimals, serializeDecimalsList } from "../utils/serialize.js";
import { buildPaginationMeta } from "../utils/pagination.js";
import { ApiError } from "../utils/ApiError.js";

async function getOwnedIncome(userId, id) {
  const income = await incomeRepo.findIncomeById(id);
  if (!income) throw ApiError.notFound("Income not found");
  if (income.userId !== userId) throw ApiError.forbidden("You do not have access to this income record");
  return income;
}

export async function createIncome(userId, { categoryId, amount, source, description, date }) {
  await assertUsableCategory(userId, categoryId, "INCOME");
  const income = await incomeRepo.createIncome({
    userId,
    categoryId: categoryId || null,
    amount,
    source,
    description,
    date: new Date(date),
  });
  return serializeDecimals(income, ["amount"]);
}

export async function listIncomes(userId, filters, pagination) {
  const { items, total } = await incomeRepo.findIncomes(userId, filters, pagination);
  return {
    items: serializeDecimalsList(items, ["amount"]),
    meta: buildPaginationMeta({ page: pagination.page, limit: pagination.limit, total }),
  };
}

export async function updateIncome(userId, id, data) {
  await getOwnedIncome(userId, id);
  if (data.categoryId !== undefined) {
    await assertUsableCategory(userId, data.categoryId, "INCOME");
  }
  const updateData = { ...data };
  if (updateData.date) updateData.date = new Date(updateData.date);

  const updated = await incomeRepo.updateIncome(id, updateData);
  return serializeDecimals(updated, ["amount"]);
}

export async function deleteIncome(userId, id) {
  await getOwnedIncome(userId, id);
  await incomeRepo.deleteIncome(id);
}
