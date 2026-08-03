import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import FormField from "../components/FormField";
import FormSelect from "../components/FormSelect";
import Modal from "../components/Modal";
import ProgressBar from "../components/ProgressBar";
import { useCategories } from "../hooks/useCategories";
import { apiListBudgets, apiSetBudget, apiDeleteBudget } from "../services/budget.service";
import { formatCurrency, MONTH_NAMES } from "../utils/format";

const now = new Date();

export default function BudgetsPage() {
  const { categories } = useCategories("EXPENSE");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const loadBudgets = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await apiListBudgets({ month, year });
      setBudgets(list);
    } catch {
      toast.error("Could not load budgets");
    } finally {
      setIsLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  function openCreate() {
    reset({ categoryId: "", amount: "" });
    setModalOpen(true);
  }

  async function onSubmit(values) {
    try {
      await apiSetBudget({ categoryId: values.categoryId, amount: Number(values.amount), month, year });
      toast.success("Budget saved");
      setModalOpen(false);
      loadBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  }

  async function onDelete(id) {
    if (!confirm("Remove this budget?")) return;
    try {
      await apiDeleteBudget(id);
      toast.success("Budget removed");
      loadBudgets();
    } catch {
      toast.error("Could not remove budget");
    }
  }

  const usedCategoryIds = new Set(budgets.map((b) => b.categoryId));
  const availableCategories = categories.filter((c) => !usedCategoryIds.has(c.id));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Monthly Budgets</h1>
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
          <button
            onClick={openCreate}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            + Set Budget
          </button>
        </div>
      </div>

      {isLoading && <p className="text-gray-400">Loading...</p>}
      {!isLoading && budgets.length === 0 && (
        <p className="text-gray-400">No budgets set for this month yet.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {budgets.map((budget) => (
          <div
            key={budget.id}
            className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium">{budget.category?.name}</span>
              <button onClick={() => onDelete(budget.id)} className="text-xs text-red-600 hover:underline">
                Remove
              </button>
            </div>
            <ProgressBar percent={budget.percentUsed} danger={budget.isOverBudget} />
            <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>
                {formatCurrency(budget.spent)} of {formatCurrency(budget.amount)}
              </span>
              <span className={budget.isOverBudget ? "font-medium text-red-600 dark:text-red-400" : ""}>
                {budget.percentUsed}%
              </span>
            </div>
            {budget.isOverBudget && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                Over budget by {formatCurrency(Math.abs(budget.remaining))}
              </p>
            )}
          </div>
        ))}
      </div>

      <Modal title="Set Budget" isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <FormSelect
            label="Category"
            error={errors.categoryId}
            registration={register("categoryId", { required: "Category is required" })}
          >
            <option value="">Select a category</option>
            {availableCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </FormSelect>
          <FormField
            label="Monthly limit"
            type="number"
            step="0.01"
            error={errors.amount}
            registration={register("amount", { required: "Amount is required" })}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
          >
            Save budget
          </button>
        </form>
      </Modal>
    </div>
  );
}
