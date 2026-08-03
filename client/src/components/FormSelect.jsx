export default function FormSelect({ label, error, registration, children, ...rest }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <select
        className={`rounded-md border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary-500
          dark:bg-gray-900 dark:text-gray-100
          ${error ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`}
        {...registration}
        {...rest}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error.message}</p>}
    </div>
  );
}
