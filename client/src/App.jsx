import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { fetchHealth } from "./services/health.service";

/**
 * Module 1 placeholder shell. This gets replaced by the real router
 * (React Router + layouts + pages) in later modules; for now it exists to
 * prove the client can reach the API and Tailwind/dark-mode work end to end.
 */
function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .catch((err) => {
        setError(err.message);
        toast.error("Could not reach the API. Is the server running?");
      });
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold text-primary-700 dark:text-primary-400">
        AI Finance & Loan Manager
      </h1>
      <p className="text-gray-600 dark:text-gray-400">Module 1 — project scaffold</p>

      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-2 font-semibold">API Health</h2>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {!error && !health && <p className="text-sm text-gray-500">Checking...</p>}
        {health && (
          <pre className="overflow-x-auto rounded bg-gray-100 p-3 text-xs dark:bg-gray-800">
            {JSON.stringify(health, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

export default App;
