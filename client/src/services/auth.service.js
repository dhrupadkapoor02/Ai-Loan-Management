import apiClient from "./apiClient";

export async function apiRegister({ name, email, password }) {
  const { data } = await apiClient.post("/auth/register", { name, email, password });
  return data.data;
}

export async function apiLogin({ email, password }) {
  const { data } = await apiClient.post("/auth/login", { email, password });
  return data.data;
}

export async function apiLogout() {
  await apiClient.post("/auth/logout");
}

export async function apiLogoutAllDevices() {
  await apiClient.post("/auth/logout-all");
}

export async function apiRefreshToken() {
  const { data } = await apiClient.post("/auth/refresh-token");
  return data.data;
}

export async function apiGetMe() {
  const { data } = await apiClient.get("/auth/me");
  return data.data.user;
}

export async function apiVerifyEmail(token) {
  const { data } = await apiClient.get(`/auth/verify-email/${token}`);
  return data.data.user;
}

export async function apiResendVerification(email) {
  const { data } = await apiClient.post("/auth/resend-verification", { email });
  return data.message;
}

export async function apiForgotPassword(email) {
  const { data } = await apiClient.post("/auth/forgot-password", { email });
  return data.message;
}

export async function apiResetPassword(token, password) {
  const { data } = await apiClient.post(`/auth/reset-password/${token}`, { password });
  return data.data.user;
}

export async function apiChangePassword({ currentPassword, newPassword }) {
  const { data } = await apiClient.patch("/auth/change-password", { currentPassword, newPassword });
  return data.data.user;
}

export async function apiUpdateProfile({ name }) {
  const { data } = await apiClient.patch("/auth/profile", { name });
  return data.data.user;
}
