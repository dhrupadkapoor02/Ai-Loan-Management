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
      {status === "verifying" && <p className="text-sm text-gray-500">Verifying your email...</p>}
      {status === "success" && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Your email has been verified. You can now log in.
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">
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
