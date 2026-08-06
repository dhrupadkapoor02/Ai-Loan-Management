import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formatCurrency } from "../utils/format";
import { loanTypeLabel } from "../utils/loanTypes";
import { apiListLoans, apiUpdateLoan, apiDeleteLoan } from "../services/loan.service";

export default function MyLoansPage() {
  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadLoans() {
    setIsLoading(true);
    try {
      const data = await apiListLoans();
      setLoans(data);
    } catch {
      toast.error("Could not load your loans");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadLoans();
  }, []);

  async function toggleActive(loan) {
    try {
      const updated = await apiUpdateLoan(loan.id, { isActive: !loan.isActive });
      setLoans((prev) => prev.map((l) => (l.id === loan.id ? updated : l)));
    } catch {
      toast.error("Could not update loan");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this saved loan? This cannot be undone.")) return;
    try {
      await apiDeleteLoan(id);
      setLoans((prev) => prev.filter((l) => l.id !== id));
      toast.success("Loan deleted");
    } catch {
      toast.error("Could not delete loan");
    }
  }

  const activeCount = loans.filter((l) => l.isActive).length;
  const totalActiveEmi = loans.filter((l) => l.isActive).reduce((sum, l) => sum + l.emiAmount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">My Loans</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Loans saved from the EMI calculator. Active loans count toward your debt obligations in the
          eligibility checker.
        </p>
      </div>

      {loans.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:w-96">
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs text-gray-500">Active loans</p>
            <p className="text-xl font-bold">{activeCount}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs text-gray-500">Total monthly EMI</p>
            <p className="text-xl font-bold">{formatCurrency(totalActiveEmi)}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : loans.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700">
          No saved loans yet. Use the EMI Calculator and click "Save this loan" to track one here.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loans.map((loan) => (
            <div
              key={loan.id}
              className={`rounded-lg border p-4 dark:border-gray-800 dark:bg-gray-900 ${
                loan.isActive ? "border-gray-200 bg-white" : "border-gray-200 bg-gray-50 opacity-70 dark:bg-gray-950"
              }`}
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="font-semibold">{loan.name || loanTypeLabel(loan.type)}</p>
                  <p className="text-xs text-gray-500">{loan.lender || loanTypeLabel(loan.type)}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    loan.isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                  }`}
                >
                  {loan.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Principal</p>
                  <p>{formatCurrency(loan.principal)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">EMI</p>
                  <p>{formatCurrency(loan.emiAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Rate</p>
                  <p>{loan.interestRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tenure</p>
                  <p>{loan.tenureMonths} mo</p>
                </div>
              </div>

              <div className="flex gap-2 text-sm">
                <button
                  onClick={() => toggleActive(loan)}
                  className="flex-1 rounded-md border border-gray-300 py-1.5 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Mark {loan.isActive ? "inactive" : "active"}
                </button>
                <button
                  onClick={() => handleDelete(loan.id)}
                  className="flex-1 rounded-md border border-red-300 py-1.5 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
