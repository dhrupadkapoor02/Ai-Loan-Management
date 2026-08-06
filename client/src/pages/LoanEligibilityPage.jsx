import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import FormField from "../components/FormField";
import { formatCurrency } from "../utils/format";
import { apiCheckEligibility } from "../services/loan.service";

export default function LoanEligibilityPage() {
  const [result, setResult] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { requestedAmount: 300000, interestRate: 9, tenureMonths: 36 },
  });

  async function onSubmit(values) {
    try {
      const data = await apiCheckEligibility({
        requestedAmount: Number(values.requestedAmount),
        interestRate: Number(values.interestRate),
        tenureMonths: Number(values.tenureMonths),
      });
      setResult(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not check eligibility");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Loan Eligibility Checker</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          A quick estimate based on your recorded income and active loans — not a guarantee from any lender.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <FormField
              label="Requested amount"
              type="number"
              step="0.01"
              error={errors.requestedAmount}
              registration={register("requestedAmount", { required: "Required", min: 1 })}
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
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
            >
              Check eligibility
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          {!result ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              Fill in the form to see your estimate
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div
                className={`rounded-md p-3 text-center font-semibold ${
                  result.isEligible
                    ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                }`}
              >
                {result.isEligible ? "Likely eligible" : "Likely not eligible"} — estimated EMI{" "}
                {formatCurrency(result.requestedEmi)}
              </div>

              <div>
                <div className="mb-1 flex justify-between text-xs text-gray-500">
                  <span>Eligibility score</span>
                  <span>{result.eligibilityScore}/100</span>
                </div>
                <ScoreBar score={result.eligibilityScore} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <Stat label="Avg. monthly income" value={formatCurrency(result.avgMonthlyIncome)} />
                <Stat label="Existing monthly EMIs" value={formatCurrency(result.existingMonthlyEmis)} />
                <Stat label="Max allowable EMI" value={formatCurrency(result.maxAllowableEmi)} />
                <Stat
                  label="Debt-to-income ratio"
                  value={result.debtToIncomeRatioPercent !== null ? `${result.debtToIncomeRatioPercent}%` : "N/A"}
                />
                <Stat label="Suggested max amount" value={formatCurrency(result.suggestedMaxPrincipal)} />
                <Stat label="Total interest (this loan)" value={formatCurrency(result.totalInterest)} />
              </div>

              <p className="text-xs text-gray-400">{result.assumptions.note}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function ScoreBar({ score }) {
  const clamped = Math.min(100, Math.max(0, score));
  const colorClass = clamped >= 70 ? "bg-green-500" : clamped >= 40 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
      <div className={`h-full rounded-full transition-all ${colorClass}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}
