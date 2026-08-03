import apiClient from "./apiClient";

export async function apiListExpenses(params = {}) {
  const { data } = await apiClient.get("/expenses", { params });
  return { expenses: data.data.expenses, meta: data.meta };
}

export async function apiCreateExpense(payload) {
  const { data } = await apiClient.post("/expenses", payload);
  return data.data.expense;
}

export async function apiUpdateExpense(id, payload) {
  const { data } = await apiClient.patch(`/expenses/${id}`, payload);
  return data.data.expense;
}

export async function apiDeleteExpense(id) {
  await apiClient.delete(`/expenses/${id}`);
}
