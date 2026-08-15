import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthLayout from "../layouts/AuthLayout";
import FormField from "../components/FormField";
import PasswordField from "../components/PasswordField";
import { useAuth } from "../hooks/useAuth";

const submitButtonClass =
  "rounded-md bg-primary-600 py-2 text-sm font-medium text-white shadow-sm shadow-primary-600/20 transition-all duration-150 hover:bg-primary-700 hover:shadow-md hover:shadow-primary-600/30 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(values) {
    try {
      await registerUser(values);
      toast.success("Account created! Check your email to verify your account.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  }

  return (
    <AuthLayout title="Create an account" subtitle="Start managing your finances with AI-powered insights.">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          label="Full name"
          error={errors.name}
          registration={register("name", { required: "Name is required" })}
        />
        <FormField
          label="Email"
          type="email"
          error={errors.email}
          registration={register("email", { required: "Email is required" })}
        />
        <PasswordField
          label="Password"
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
        <PasswordField
          label="Confirm password"
          error={errors.confirmPassword}
          registration={register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => value === watch("password") || "Passwords do not match",
          })}
        />

        <button type="submit" disabled={isSubmitting} className={submitButtonClass}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
