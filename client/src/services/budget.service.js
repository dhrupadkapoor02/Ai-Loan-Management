import apiClient from "./apiClient";

export async function apiListBudgets({ month, year } = {}) {
  const { data } = await apiClient.get("/budgets", { params: { month, year } });
  return data.data.budgets;
}

export async function apiSetBudget(payload) {
  const { data } = await apiClient.post("/budgets", payload);
  return data.data.budget;
}

export async function apiDeleteBudget(id) {
  await apiClient.delete(`/budgets/${id}`);
}
