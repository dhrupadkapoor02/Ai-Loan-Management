import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import AuthLayout from "../layouts/AuthLayout";
import FormField from "../components/FormField";
import { apiResetPassword } from "../services/auth.service";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(values) {
    try {
      await apiResetPassword(token, values.password);
      toast.success("Password reset. Please log in with your new password.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset link is invalid or has expired");
    }
  }

  return (
    <AuthLayout title="Reset password" subtitle="Choose a new password for your account.">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          label="New password"
          type="password"
          error={errors.password}
          registration={register("password", {
            required: "Password is required",
            minLength: { value: 8, message: "At least 8 characters" },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
              message: "Needs an uppercase letter, lowercase letter, and a number",
            },
          })}
        />
        <FormField
          label="Confirm new password"
          type="password"
          error={errors.confirmPassword}
          registration={register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => value === watch("password") || "Passwords do not match",
          })}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary-600 py-2 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-60"
        >
          {isSubmitting ? "Resetting..." : "Reset password"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <Link to="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
