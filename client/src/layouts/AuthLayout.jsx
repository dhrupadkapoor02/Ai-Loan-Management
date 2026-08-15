import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-gray-50 to-gray-100 px-4 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
      {/* Subtle drifting gradient accents — decorative only, purely visual polish */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 animate-blob rounded-full bg-primary-200/40 blur-3xl dark:bg-primary-900/20" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 animate-blob rounded-full bg-blue-200/40 blur-3xl [animation-delay:4s] dark:bg-blue-900/20" />
      </div>

      <ThemeToggle className="absolute right-4 top-4 z-10" />

      <div className="relative z-10 w-full max-w-sm animate-fade-in-up">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-base font-bold text-white shadow-sm shadow-primary-600/30">
            ₹
          </span>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">AI Finance &amp; Loan Manager</span>
        </Link>

        <div className="rounded-xl border border-gray-200/80 bg-white/90 p-6 shadow-xl shadow-gray-200/50 backdrop-blur-sm transition-shadow dark:border-gray-800 dark:bg-gray-900/90 dark:shadow-black/20">
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
