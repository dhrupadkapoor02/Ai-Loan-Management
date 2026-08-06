import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Bar } from "react-chartjs-2";
import toast from "react-hot-toast";
import "../utils/chartSetup";
import FormField from "../components/FormField";
import { formatCurrency } from "../utils/format";
import { apiCompareLoans } from "../services/loan.service";

const emptyOffer = { label: "", principal: "", interestRate: "", tenureMonths: "" };

export default function LoanComparisonPage() {
  const [results, setResults] = useState(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      offers: [
        { label: "Offer A", principal: 500000, interestRate: 8.5, tenureMonths: 60 },
        { label: "Offer B", principal: 500000, interestRate: 9.5, tenureMonths: 48 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "offers" });

  async function onSubmit(values) {
    try {
      const offers = values.offers.map((o) => ({
        label: o.label,
        principal: Number(o.principal),
        interestRate: Number(o.interestRate),
        tenureMonths: Number(o.tenureMonths),
      }));
      const comparison = await apiCompareLoans(offers);
      setResults(comparison);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not compare loans");
    }
  }

  const chartData = results && {
    labels: results.map((r) => r.label),
    datasets: [
      { label: "EMI", data: results.map((r) => r.emi), backgroundColor: "#3b82f6" },
      { label: "Total Interest", data: results.map((r) => r.totalInterest), backgroundColor: "#f97316" },
    ],
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Loan Comparison</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Compare up to 5 loan offers side by side.
        </p>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-2 gap-3 rounded-md border border-gray-100 p-3 dark:border-gray-800 sm:grid-cols-5 sm:items-end">
              <FormField label="Label" registration={register(`offers.${index}.label`)} />
              <FormField
                label="Principal"
                type="number"
                step="0.01"
                registration={register(`offers.${index}.principal`, { required: true, min: 1 })}
              />
              <FormField
                label="Rate (%)"
                type="number"
                step="0.01"
                registration={register(`offers.${index}.interestRate`, { required: true, min: 0, max: 50 })}
              />
              <FormField
                label="Tenure (mo)"
                type="number"
                registration={register(`offers.${index}.tenureMonths`, { required: true, min: 1, max: 480 })}
              />
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={fields.length <= 2}
                className="rounded-md border border-red-300 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-40 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => append({ ...emptyOffer, label: `Offer ${String.fromCharCode(65 + fields.length)}` })}
              disabled={fields.length >= 5}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              + Add offer
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-md bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
            >
              Compare
            </button>
          </div>
        </form>
      </section>

      {results && (
        <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6 h-64">
            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-800">
                  <th className="py-2">Offer</th>
                  <th className="py-2 text-right">Principal</th>
                  <th className="py-2 text-right">Rate</th>
                  <th className="py-2 text-right">Tenure</th>
                  <th className="py-2 text-right">EMI</th>
                  <th className="py-2 text-right">Total Interest</th>
                  <th className="py-2 text-right">Total Payment</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 font-medium">{r.label}</td>
                    <td className="py-2 text-right">{formatCurrency(r.principal)}</td>
                    <td className="py-2 text-right">{r.interestRate}%</td>
                    <td className="py-2 text-right">{r.tenureMonths} mo</td>
                    <td className="py-2 text-right font-semibold">{formatCurrency(r.emi)}</td>
                    <td className="py-2 text-right">{formatCurrency(r.totalInterest)}</td>
                    <td className="py-2 text-right">{formatCurrency(r.totalPayment)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
