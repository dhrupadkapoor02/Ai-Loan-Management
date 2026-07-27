import { NavLink, Outlet } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

const navLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
  }`;

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      toast.success("Logged out");
    } catch {
      toast.error("Logout failed, please try again");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="font-bold text-primary-700 dark:text-primary-400">AI Finance & Loan Manager</span>
          <nav className="flex items-center gap-2">
            <NavLink to="/dashboard" className={navLinkClass} end>
              Dashboard
            </NavLink>
            <NavLink to="/profile" className={navLinkClass}>
              Profile
            </NavLink>
            <span className="mx-2 hidden text-sm text-gray-400 sm:inline">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
