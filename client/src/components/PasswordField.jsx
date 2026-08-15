import { useState } from "react";

export default function PasswordField({ label, error, registration, ...rest }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          className={`w-full rounded-md border px-3 py-2 pr-10 text-sm outline-none transition focus:ring-2 focus:ring-primary-500
            dark:bg-gray-900 dark:text-gray-100
            ${error ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`}
          {...registration}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
        >
          {visible ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a21.8 21.8 0 015.06-6.06M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a21.77 21.77 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
              <path d="M1 1l22 22" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error.message}</p>}
    </div>
  );
}
