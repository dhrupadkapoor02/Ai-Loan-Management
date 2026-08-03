import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import FormField from "../components/FormField";
import Modal from "../components/Modal";
import ProgressBar from "../components/ProgressBar";
import {
  apiListSavingsGoals,
  apiCreateSavingsGoal,
  apiDeleteSavingsGoal,
  apiContributeSavingsGoal,
} from "../services/savingsGoal.service";
import { formatCurrency, formatDate } from "../utils/format";

export default function SavingsGoalsPage() {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [contributeTarget, setContributeTarget] = useState(null);

  const createForm = useForm();
  const contributeForm = useForm();

  const loadGoals = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await apiListSavingsGoals();
      setGoals(list);
    } catch {
      toast.error("Could not load savings goals");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  async function onCreate(values) {
    try {
      await apiCreateSavingsGoal({
        title: values.title,
        targetAmount: Number(values.targetAmount),
        targetDate: values.targetDate || undefined,
      });
      toast.success("Savings goal created");
      setCreateModalOpen(false);
      createForm.reset();
      loadGoals();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  }

  async function onContribute(values) {
    try {
      await apiContributeSavingsGoal(contributeTarget.id, Number(values.amount));
      toast.success("Contribution added");
      setContributeTarget(null);
      contributeForm.reset();
      loadGoals();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  }

  async function onDelete(id) {
    if (!confirm("Delete this savings goal?")) return;
    try {
      await apiDeleteSavingsGoal(id);
      toast.success("Savings goal deleted");
      loadGoals();
    } catch {
      toast.error("Could not delete savings goal");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Savings Goals</h1>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          + New Goal
        </button>
      </div>

      {isLoading && <p className="text-gray-400">Loading...</p>}
      {!isLoading && goals.length === 0 && <p className="text-gray-400">No savings goals yet.</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 1000) / 10);
          return (
            <div
              key={goal.id}
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">{goal.title}</span>
                {goal.isCompleted && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">
                    Completed
                  </span>
                )}
              </div>
              <ProgressBar percent={percent} />
              <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>
                  {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                </span>
                <span>{percent}%</span>
              </div>
              {goal.targetDate && (
                <p className="mt-1 text-xs text-gray-400">Target: {formatDate(goal.targetDate)}</p>
              )}
              <div className="mt-3 flex gap-3 text-sm">
                <button
                  onClick={() => setContributeTarget(goal)}
                  className="text-primary-600 hover:underline"
                  disabled={goal.isCompleted}
                >
                  Add funds
                </button>
                <button onClick={() => onDelete(goal.id)} className="text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal title="New Savings Goal" isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)}>
        <form className="flex flex-col gap-4" onSubmit={createForm.handleSubmit(onCreate)}>
          <FormField
            label="Goal title"
            error={createForm.formState.errors.title}
            registration={createForm.register("title", { required: "Title is required" })}
            placeholder="Emergency fund, Vacation, New laptop..."
          />
          <FormField
            label="Target amount"
            type="number"
            step="0.01"
            error={createForm.formState.errors.targetAmount}
            registration={createForm.register("targetAmount", { required: "Target amount is required" })}
          />
          <FormField
            label="Target date (optional)"
            type="date"
            error={createForm.formState.errors.targetDate}
            registration={createForm.register("targetDate")}
          />
          <button
            type="submit"
            disabled={createForm.formState.isSubmitting}
            className="rounded-md bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
          >
            Create goal
          </button>
        </form>
      </Modal>

      <Modal
        title={`Add funds — ${contributeTarget?.title || ""}`}
        isOpen={Boolean(contributeTarget)}
        onClose={() => setContributeTarget(null)}
      >
        <form className="flex flex-col gap-4" onSubmit={contributeForm.handleSubmit(onContribute)}>
          <FormField
            label="Amount"
            type="number"
            step="0.01"
            error={contributeForm.formState.errors.amount}
            registration={contributeForm.register("amount", { required: "Amount is required" })}
          />
          <button
            type="submit"
            disabled={contributeForm.formState.isSubmitting}
            className="rounded-md bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
          >
            Contribute
          </button>
        </form>
      </Modal>
    </div>
  );
}
