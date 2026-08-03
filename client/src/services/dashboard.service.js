import apiClient from "./apiClient";

export async function apiGetDashboard({ month, year } = {}) {
  const { data } = await apiClient.get("/dashboard", { params: { month, year } });
  return data.data;
}
