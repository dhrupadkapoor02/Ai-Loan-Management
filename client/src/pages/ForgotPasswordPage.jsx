import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import AuthLayout from "../layouts/AuthLayout";
import FormField from "../components/FormField";
import { apiForgotPassword } from "../services/auth.service";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(values) {
    try {
      await apiForgotPassword(values.email);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  }

  return (
    <AuthLayout title="Forgot password" subtitle="We'll email you a link to reset it.">
      {sent ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          If an account with that email exists, a password reset link is on its way. Check your inbox.
        </p>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <FormField
            label="Email"
            type="email"
            error={errors.email}
            registration={register("email", { required: "Email is required" })}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary-600 py-2 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-60"
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}

      <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <Link to="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
