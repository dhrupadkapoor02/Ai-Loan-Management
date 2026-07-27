import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthLayout from "../layouts/AuthLayout";
import FormField from "../components/FormField";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(values) {
    try {
      await login(values);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <AuthLayout title="Log in" subtitle="Welcome back — enter your details below.">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          label="Email"
          type="email"
          error={errors.email}
          registration={register("email", { required: "Email is required" })}
        />
        <FormField
          label="Password"
          type="password"
          error={errors.password}
          registration={register("password", { required: "Password is required" })}
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline dark:text-primary-400">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary-600 py-2 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-60"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
