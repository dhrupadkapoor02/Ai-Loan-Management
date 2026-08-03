import * as budgetRepo from "../repositories/budget.repository.js";
import * as expenseRepo from "../repositories/expense.repository.js";
import { assertUsableCategory } from "./category.service.js";
import { serializeDecimals } from "../utils/serialize.js";
import { monthRange, currentMonthYear } from "../utils/dateRange.js";
import { ApiError } from "../utils/ApiError.js";

export async function setBudget(userId, { categoryId, amount, month, year }) {
  await assertUsableCategory(userId, categoryId, "EXPENSE");
  const budget = await budgetRepo.upsertBudget({ userId, categoryId, amount, month, year });
  return serializeDecimals(budget, ["amount"]);
}

export async function listBudgets(userId, { month, year } = currentMonthYear()) {
  const budgets = await budgetRepo.findBudgetsForMonth(userId, month, year);
  const { start, end } = monthRange(month, year);

  const withSpend = await Promise.all(
    budgets.map(async (budget) => {
      const spent = await expenseRepo.sumExpense(userId, {
        categoryId: budget.categoryId,
        startDate: start,
        endDate: end,
      });
      const amount = Number(budget.amount);
      const remaining = amount - spent;
      const percentUsed = amount > 0 ? Math.round((spent / amount) * 1000) / 10 : 0;

      return {
        ...serializeDecimals(budget, ["amount"]),
        spent,
        remaining,
        percentUsed,
        isOverBudget: spent > amount,
      };
    })
  );

  return withSpend;
}

async function getOwnedBudget(userId, id) {
  const budget = await budgetRepo.findBudgetById(id);
  if (!budget) throw ApiError.notFound("Budget not found");
  if (budget.userId !== userId) throw ApiError.forbidden("You do not have access to this budget");
  return budget;
}

export async function deleteBudget(userId, id) {
  await getOwnedBudget(userId, id);
  await budgetRepo.deleteBudget(id);
}
