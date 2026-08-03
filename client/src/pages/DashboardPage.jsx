import "../utils/chartSetup";
import { useEffect, useState, useCallback } from "react";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { apiGetDashboard } from "../services/dashboard.service";
import { formatCurrency, monthLabel, MONTH_NAMES } from "../utils/format";

const now = new Date();

const CHART_COLORS = [
  "#3b82f6",
  "#f97316",
  "#22c55e",
  "#a855f7",
  "#ef4444",
  "#eab308",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#6366f1",
];

function StatCard({ label, value, tone }) {
  const toneClass =
    tone === "positive"
      ? "text-green-600 dark:text-green-400"
      : tone === "negative"
      ? "text-red-600 dark:text-red-400"
      : "text-gray-900 dark:text-gray-100";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiGetDashboard({ month, year });
      setDashboard(data);
    } catch {
      toast.error("Could not load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading || !dashboard) {
    return <p className="text-gray-400">Loading dashboard...</p>;
  }

  const { summary, charts } = dashboard;
  const trendLabels = charts.incomeVsExpense.map((t) => monthLabel(t.month, t.year));

  const expenseDistributionData = {
    labels: charts.expenseDistribution.map((d) => d.category?.name || "Uncategorized"),
    datasets: [
      {
        data: charts.expenseDistribution.map((d) => d.total),
        backgroundColor: CHART_COLORS,
        borderWidth: 0,
      },
    ],
  };

  const incomeVsExpenseData = {
    labels: trendLabels,
    datasets: [
      { label: "Income", data: charts.incomeVsExpense.map((t) => t.income), backgroundColor: "#22c55e" },
      { label: "Expense", data: charts.incomeVsExpense.map((t) => t.expense), backgroundColor: "#ef4444" },
    ],
  };

  const monthlyExpensesData = {
    labels: trendLabels,
    datasets: [
      {
        label: "Total Expense",
        data: charts.monthlyExpenses.map((t) => t.total),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const savingsTrendData = {
    labels: trendLabels,
    datasets: [
      {
        label: "Cumulative Savings",
        data: charts.savingsTrend.map((t) => t.cumulativeSavings),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = { responsive: true, plugins: { legend: { position: "bottom" } } };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!user?.isEmailVerified && (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300">
          Your email address isn&apos;t verified yet. Check your inbox for the verification link.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Income" value={formatCurrency(summary.totalIncome)} tone="positive" />
        <StatCard label="Total Expense" value={formatCurrency(summary.totalExpense)} tone="negative" />
        <StatCard
          label="Net Savings"
          value={formatCurrency(summary.netSavings)}
          tone={summary.netSavings >= 0 ? "positive" : "negative"}
        />
        <StatCard
          label="Budgets Over Limit"
          value={`${summary.overBudgetCount} / ${summary.budgetCount}`}
          tone={summary.overBudgetCount > 0 ? "negative" : undefined}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 font-semibold">Expense Distribution</h2>
          {charts.expenseDistribution.length === 0 ? (
            <p className="text-sm text-gray-400">No expenses this month yet.</p>
          ) : (
            <Doughnut data={expenseDistributionData} options={chartOptions} />
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 font-semibold">Income vs Expense (6 months)</h2>
          <Bar data={incomeVsExpenseData} options={chartOptions} />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 font-semibold">Monthly Expenses Trend</h2>
          <Line data={monthlyExpensesData} options={chartOptions} />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 font-semibold">Savings Trend</h2>
          <Line data={savingsTrendData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
