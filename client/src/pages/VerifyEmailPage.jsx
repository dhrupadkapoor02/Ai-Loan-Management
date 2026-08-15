import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { apiVerifyEmail } from "../services/auth.service";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying"); // verifying | success | error

  useEffect(() => {
    let cancelled = false;

    apiVerifyEmail(token)
      .then(() => !cancelled && setStatus("success"))
      .catch(() => !cancelled && setStatus("error"));

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthLayout title="Email verification">
      {status === "verifying" && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg className="h-4 w-4 animate-spin text-primary-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
          </svg>
          Verifying your email...
        </div>
      )}
      {status === "success" && (
        <p className="animate-fade-in text-sm text-green-600 dark:text-green-400">
          Your email has been verified. You can now log in.
        </p>
      )}
      {status === "error" && (
        <p className="animate-fade-in text-sm text-red-600 dark:text-red-400">
          This verification link is invalid or has expired.
        </p>
      )}
      <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <Link to="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
