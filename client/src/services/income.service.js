import apiClient from "./apiClient";

export async function apiListIncomes(params = {}) {
  const { data } = await apiClient.get("/incomes", { params });
  return { incomes: data.data.incomes, meta: data.meta };
}

export async function apiCreateIncome(payload) {
  const { data } = await apiClient.post("/incomes", payload);
  return data.data.income;
}

export async function apiUpdateIncome(id, payload) {
  const { data } = await apiClient.patch(`/incomes/${id}`, payload);
  return data.data.income;
}

export async function apiDeleteIncome(id) {
  await apiClient.delete(`/incomes/${id}`);
}
