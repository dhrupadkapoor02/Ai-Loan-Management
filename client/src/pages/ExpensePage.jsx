import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import FormField from "../components/FormField";
import FormSelect from "../components/FormSelect";
import Modal from "../components/Modal";
import { useCategories } from "../hooks/useCategories";
import { apiListExpenses, apiCreateExpense, apiUpdateExpense, apiDeleteExpense } from "../services/expense.service";
import { formatCurrency, formatDate, toDateInputValue } from "../utils/format";

export default function ExpensePage() {
  const { categories } = useCategories("EXPENSE");
  const [expenses, setExpenses] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const loadExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const { expenses: items, meta: pageMeta } = await apiListExpenses({ page, limit: 10 });
      setExpenses(items);
      setMeta(pageMeta);
    } catch {
      toast.error("Could not load expense records");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  function openCreate() {
    setEditing(null);
    reset({
      amount: "",
      date: toDateInputValue(new Date()),
      categoryId: "",
      paymentMethod: "",
      description: "",
    });
    setModalOpen(true);
  }

  function openEdit(expense) {
    setEditing(expense);
    reset({
      amount: expense.amount,
      date: toDateInputValue(expense.date),
      categoryId: expense.categoryId || "",
      paymentMethod: expense.paymentMethod || "",
      description: expense.description || "",
    });
    setModalOpen(true);
  }

  async function onSubmit(values) {
    const payload = {
      amount: Number(values.amount),
      date: values.date,
      categoryId: values.categoryId || undefined,
      paymentMethod: values.paymentMethod || undefined,
      description: values.description || undefined,
    };

    try {
      if (editing) {
        await apiUpdateExpense(editing.id, payload);
        toast.success("Expense updated");
      } else {
        await apiCreateExpense(payload);
        toast.success("Expense added");
      }
      setModalOpen(false);
      loadExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  }

  async function onDelete(id) {
    if (!confirm("Delete this expense record?")) return;
    try {
      await apiDeleteExpense(id);
      toast.success("Expense deleted");
      loadExpenses();
    } catch {
      toast.error("Could not delete expense");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <button
          onClick={openCreate}
          className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          + Add Expense
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
            {!isLoading && expenses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  No expenses recorded yet.
                </td>
              </tr>
            )}
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td className="px-4 py-3">{formatDate(expense.date)}</td>
                <td className="px-4 py-3">{expense.category?.name || "Uncategorized"}</td>
                <td className="px-4 py-3">{expense.paymentMethod || "—"}</td>
                <td className="px-4 py-3 text-right font-medium text-red-600 dark:text-red-400">
                  -{formatCurrency(expense.amount)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(expense)} className="mr-3 text-primary-600 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => onDelete(expense.id)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-md border px-3 py-1 disabled:opacity-40 dark:border-gray-700"
          >
            Prev
          </button>
          <span>
            Page {meta.page} of {meta.totalPages}
          </span>
          <button
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border px-3 py-1 disabled:opacity-40 dark:border-gray-700"
          >
            Next
          </button>
        </div>
      )}

      <Modal
        title={editing ? "Edit Expense" : "Add Expense"}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <FormField
            label="Amount"
            type="number"
            step="0.01"
            error={errors.amount}
            registration={register("amount", { required: "Amount is required" })}
          />
          <FormField
            label="Date"
            type="date"
            error={errors.date}
            registration={register("date", { required: "Date is required" })}
          />
          <FormSelect label="Category" error={errors.categoryId} registration={register("categoryId")}>
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </FormSelect>
          <FormField
            label="Payment method (optional)"
            error={errors.paymentMethod}
            registration={register("paymentMethod")}
            placeholder="Cash, Card, UPI..."
          />
          <FormField
            label="Description (optional)"
            error={errors.description}
            registration={register("description")}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {editing ? "Save changes" : "Add expense"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
