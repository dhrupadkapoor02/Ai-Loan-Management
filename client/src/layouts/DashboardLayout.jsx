import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ to: "/dashboard", label: "Dashboard", end: true }],
  },
  {
    label: "Finance",
    items: [
      { to: "/incomes", label: "Income" },
      { to: "/expenses", label: "Expenses" },
      { to: "/budgets", label: "Budgets" },
      { to: "/savings-goals", label: "Savings Goals" },
      { to: "/transactions", label: "Transactions" },
    ],
  },
  {
    label: "Loans",
    items: [
      { to: "/emi-calculator", label: "EMI Calculator" },
      { to: "/my-loans", label: "My Loans" },
      { to: "/loan-eligibility", label: "Eligibility Checker" },
      { to: "/loan-comparison", label: "Compare Loans" },
      { to: "/loan-applications", label: "Applications" },
    ],
  },
];

const navLinkClass = ({ isActive }) =>
  `block rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
  }`;

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout();
      toast.success("Logged out");
    } catch {
      toast.error("Logout failed, please try again");
    }
  }

  const sidebarContent = (
    <>
      <div className="px-3 py-4">
        <span className="text-lg font-bold text-primary-700 dark:text-primary-400">AI Finance &amp; Loan Manager</span>
      </div>
      <nav className="flex flex-col gap-4 px-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{group.label}</p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass} onClick={() => setMobileNavOpen(false)}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar (slide-over) */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 overflow-y-auto bg-white shadow-xl dark:bg-gray-900">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
            aria-label="Open navigation"
          >
            ☰
          </button>
          <span className="font-semibold text-primary-700 dark:text-primary-400 lg:hidden">AI Finance</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-gray-400 sm:inline">{user?.email}</span>
            <NavLink to="/profile" className={navLinkClass}>
              Profile
            </NavLink>
            <button
              onClick={handleLogout}
              className="rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 px-4 py-8 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
