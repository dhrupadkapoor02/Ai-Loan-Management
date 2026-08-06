import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import FormField from "../components/FormField";
import FormSelect from "../components/FormSelect";
import Modal from "../components/Modal";
import { formatCurrency, formatDate } from "../utils/format";
import { LOAN_TYPES, loanTypeLabel, APPLICATION_STATUS_STYLES } from "../utils/loanTypes";
import {
  apiListLoanApplications,
  apiSubmitLoanApplication,
  apiCancelLoanApplication,
} from "../services/loanApplication.service";

const CANCELLABLE = ["PENDING", "UNDER_REVIEW"];

export default function LoanApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { type: "PERSONAL" } });

  async function loadApplications() {
    setIsLoading(true);
    try {
      const data = await apiListLoanApplications();
      setApplications(data);
    } catch {
      toast.error("Could not load loan applications");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  async function onSubmit(values) {
    try {
      await apiSubmitLoanApplication({
        type: values.type,
        amountRequested: Number(values.amountRequested),
        interestRate: Number(values.interestRate),
        tenureMonths: Number(values.tenureMonths),
        purpose: values.purpose || undefined,
      });
      toast.success("Application submitted");
      setModalOpen(false);
      reset();
      loadApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit application");
    }
  }

  async function handleCancel(id) {
    if (!confirm("Cancel this loan application?")) return;
    try {
      await apiCancelLoanApplication(id);
      toast.success("Application cancelled");
      loadApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cancel application");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Loan Applications</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Submit and track your loan applications.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          + New application
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : applications.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700">
          No loan applications yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((app) => (
            <div
              key={app.id}
              className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{loanTypeLabel(app.type)}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${APPLICATION_STATUS_STYLES[app.status]}`}>
                    {app.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {formatCurrency(app.amountRequested)} · {app.interestRate}% · {app.tenureMonths} months
                </p>
                {app.purpose && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{app.purpose}</p>}
                <p className="mt-1 text-xs text-gray-400">Submitted {formatDate(app.createdAt)}</p>
                {app.reviewNotes && (
                  <p className="mt-1 text-xs italic text-gray-500">Reviewer note: {app.reviewNotes}</p>
                )}
              </div>

              {CANCELLABLE.includes(app.status) && (
                <button
                  onClick={() => handleCancel(app.id)}
                  className="self-start rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal title="New loan application" isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <FormSelect label="Loan type" registration={register("type")}>
            {LOAN_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </FormSelect>
          <FormField
            label="Amount requested"
            type="number"
            step="0.01"
            error={errors.amountRequested}
            registration={register("amountRequested", { required: "Required", min: 1 })}
          />
          <FormField
            label="Expected interest rate (%)"
            type="number"
            step="0.01"
            error={errors.interestRate}
            registration={register("interestRate", { required: "Required", min: 0, max: 50 })}
          />
          <FormField
            label="Tenure (months)"
            type="number"
            error={errors.tenureMonths}
            registration={register("tenureMonths", { required: "Required", min: 1, max: 480 })}
          />
          <FormField label="Purpose (optional)" registration={register("purpose")} />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
          >
            Submit application
          </button>
        </form>
      </Modal>
    </div>
  );
}
