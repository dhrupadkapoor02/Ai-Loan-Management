import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import FormField from "../components/FormField";
import { useAuth } from "../hooks/useAuth";

export default function ProfilePage() {
  const { user, updateProfile, changePassword, logoutAllDevices } = useAuth();
  const navigate = useNavigate();

  const profileForm = useForm({ defaultValues: { name: user?.name || "" } });
  const passwordForm = useForm();

  async function onUpdateProfile(values) {
    try {
      await updateProfile(values);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update profile");
    }
  }

  async function onChangePassword(values) {
    try {
      await changePassword(values);
      toast.success("Password changed. Please log in again.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not change password");
    }
  }

  async function onLogoutAllDevices() {
    try {
      await logoutAllDevices();
      toast.success("Logged out of all devices");
      navigate("/login");
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="flex max-w-lg flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 font-semibold">Update profile</h2>
        <form className="flex flex-col gap-4" onSubmit={profileForm.handleSubmit(onUpdateProfile)}>
          <FormField
            label="Full name"
            error={profileForm.formState.errors.name}
            registration={profileForm.register("name", { required: "Name is required" })}
          />
          <button
            type="submit"
            disabled={profileForm.formState.isSubmitting}
            className="self-start rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
          >
            Save changes
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 font-semibold">Change password</h2>
        <form className="flex flex-col gap-4" onSubmit={passwordForm.handleSubmit(onChangePassword)}>
          <FormField
            label="Current password"
            type="password"
            error={passwordForm.formState.errors.currentPassword}
            registration={passwordForm.register("currentPassword", { required: "Required" })}
          />
          <FormField
            label="New password"
            type="password"
            error={passwordForm.formState.errors.newPassword}
            registration={passwordForm.register("newPassword", {
              required: "Required",
              minLength: { value: 8, message: "At least 8 characters" },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                message: "Needs an uppercase letter, lowercase letter, and a number",
              },
            })}
          />
          <button
            type="submit"
            disabled={passwordForm.formState.isSubmitting}
            className="self-start rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
          >
            Change password
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/30">
        <h2 className="mb-2 font-semibold text-red-800 dark:text-red-300">Danger zone</h2>
        <p className="mb-4 text-sm text-red-700 dark:text-red-400">
          Log out of every device where you're currently signed in.
        </p>
        <button
          onClick={onLogoutAllDevices}
          className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/60"
        >
          Log out of all devices
        </button>
      </section>
    </div>
  );
}
