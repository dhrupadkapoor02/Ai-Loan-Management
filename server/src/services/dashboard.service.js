import * as incomeRepo from "../repositories/income.repository.js";
import * as expenseRepo from "../repositories/expense.repository.js";
import * as budgetService from "./budget.service.js";
import { monthRange, currentMonthYear, lastNMonths } from "../utils/dateRange.js";

const TREND_MONTHS = 6;

async function monthlyTotals(userId, months) {
  return Promise.all(
    months.map(async ({ month, year }) => {
      const { start, end } = monthRange(month, year);
      const [income, expense] = await Promise.all([
        incomeRepo.sumIncome(userId, { startDate: start, endDate: end }),
        expenseRepo.sumExpense(userId, { startDate: start, endDate: end }),
      ]);
      return { month, year, income, expense, net: income - expense };
    })
  );
}

export async function getDashboard(userId, { month, year } = currentMonthYear()) {
  const { start, end } = monthRange(month, year);

  const [totalIncome, totalExpense, expenseDistribution, budgets] = await Promise.all([
    incomeRepo.sumIncome(userId, { startDate: start, endDate: end }),
    expenseRepo.sumExpense(userId, { startDate: start, endDate: end }),
    expenseRepo.sumExpenseByCategory(userId, { startDate: start, endDate: end }),
    budgetService.listBudgets(userId, { month, year }),
  ]);

  const months = lastNMonths(TREND_MONTHS, { month, year });
  const trend = await monthlyTotals(userId, months);

  let cumulativeSavings = 0;
  const savingsTrend = trend.map((t) => {
    cumulativeSavings += t.net;
    return { month: t.month, year: t.year, cumulativeSavings };
  });

  return {
    summary: {
      month,
      year,
      totalIncome,
      totalExpense,
      netSavings: totalIncome - totalExpense,
      budgetCount: budgets.length,
      overBudgetCount: budgets.filter((b) => b.isOverBudget).length,
    },
    charts: {
      // Doughnut/pie: where expense money went this month
      expenseDistribution,
      // Grouped bar: income vs expense per month, last 6 months
      incomeVsExpense: trend.map((t) => ({ month: t.month, year: t.year, income: t.income, expense: t.expense })),
      // Line/bar: total expense per month, last 6 months
      monthlyExpenses: trend.map((t) => ({ month: t.month, year: t.year, total: t.expense })),
      // Line: running (cumulative) net savings per month, last 6 months
      savingsTrend,
    },
    budgets,
  };
}
