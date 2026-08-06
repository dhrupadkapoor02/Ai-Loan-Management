import { useState } from "react";
import { useForm } from "react-hook-form";
import { Doughnut } from "react-chartjs-2";
import toast from "react-hot-toast";
import "../utils/chartSetup";
import FormField from "../components/FormField";
import FormSelect from "../components/FormSelect";
import Modal from "../components/Modal";
import { formatCurrency } from "../utils/format";
import { LOAN_TYPES } from "../utils/loanTypes";
import { apiCalculateEmi, apiSaveLoan } from "../services/loan.service";

export default function EmiCalculatorPage() {
  const [result, setResult] = useState(null);
  const [lastInputs, setLastInputs] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { principal: 500000, interestRate: 8.5, tenureMonths: 60 },
  });

  const saveForm = useForm({ defaultValues: { type: "PERSONAL", name: "", lender: "", notes: "" } });

  async function onCalculate(values) {
    try {
      const payload = {
        principal: Number(values.principal),
        interestRate: Number(values.interestRate),
        tenureMonths: Number(values.tenureMonths),
      };
      const data = await apiCalculateEmi(payload);
      setResult(data);
      setLastInputs(payload);
      setShowSchedule(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not calculate EMI");
    }
  }

  async function onSaveLoan(values) {
    try {
      await apiSaveLoan({ ...lastInputs, ...values });
      toast.success("Loan saved — find it under My Loans");
      setSaveModalOpen(false);
      saveForm.reset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save loan");
    }
  }

  const chartData = result && {
    labels: ["Principal", "Interest"],
    datasets: [
      {
        data: [lastInputs.principal, result.totalInterest],
        backgroundColor: ["#3b82f6", "#f97316"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">EMI Calculator</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Estimate your monthly payment, total interest, and full repayment schedule.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onCalculate)}>
            <FormField
              label="Loan amount"
              type="number"
              step="0.01"
              error={errors.principal}
              registration={register("principal", { required: "Required", min: { value: 1, message: "Must be positive" } })}
            />
            <FormField
              label="Annual interest rate (%)"
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
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
            >
              Calculate
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          {!result ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              Fill in the form to see your results
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-500">Monthly EMI</p>
                  <p className="text-lg font-bold text-primary-700 dark:text-primary-400">
                    {formatCurrency(result.emi)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Interest</p>
                  <p className="text-lg font-bold">{formatCurrency(result.totalInterest)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Payment</p>
                  <p className="text-lg font-bold">{formatCurrency(result.totalPayment)}</p>
                </div>
              </div>

              <div className="mx-auto h-48 w-48">
                <Doughnut data={chartData} options={{ plugins: { legend: { position: "bottom" } } }} />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowSchedule((s) => !s)}
                  className="flex-1 rounded-md border border-gray-300 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  {showSchedule ? "Hide" : "View"} amortization schedule
                </button>
                <button
                  onClick={() => setSaveModalOpen(true)}
                  className="flex-1 rounded-md bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700"
                >
                  Save this loan
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {result && showSchedule && (
        <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 font-semibold">Amortization schedule</h2>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white dark:bg-gray-900">
                <tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-800">
                  <th className="py-2">Month</th>
                  <th className="py-2 text-right">EMI</th>
                  <th className="py-2 text-right">Principal</th>
                  <th className="py-2 text-right">Interest</th>
                  <th className="py-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((row) => (
                  <tr key={row.month} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-1.5">{row.month}</td>
                    <td className="py-1.5 text-right">{formatCurrency(row.emi)}</td>
                    <td className="py-1.5 text-right">{formatCurrency(row.principalComponent)}</td>
                    <td className="py-1.5 text-right">{formatCurrency(row.interestComponent)}</td>
                    <td className="py-1.5 text-right">{formatCurrency(row.remainingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <Modal title="Save this loan" isOpen={saveModalOpen} onClose={() => setSaveModalOpen(false)}>
        <form className="flex flex-col gap-4" onSubmit={saveForm.handleSubmit(onSaveLoan)}>
          <FormSelect label="Loan type" registration={saveForm.register("type")}>
            {LOAN_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </FormSelect>
          <FormField label="Nickname (optional)" registration={saveForm.register("name")} placeholder="e.g. Home Loan - SBI" />
          <FormField label="Lender (optional)" registration={saveForm.register("lender")} />
          <FormField label="Notes (optional)" registration={saveForm.register("notes")} />
          <button
            type="submit"
            disabled={saveForm.formState.isSubmitting}
            className="rounded-md bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
          >
            Save
          </button>
        </form>
      </Modal>
    </div>
  );
}
