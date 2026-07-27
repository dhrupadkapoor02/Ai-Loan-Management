import { useAuth } from "../hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
      <p className="mt-1 text-gray-500 dark:text-gray-400">
        This is a placeholder — the real finance dashboard (income, expenses, budgets, charts) is built in Module
        3.
      </p>

      {!user?.isEmailVerified && (
        <div className="mt-6 rounded-md border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300">
          Your email address isn&apos;t verified yet. Check your inbox for the verification link.
        </div>
      )}
    </div>
  );
}
