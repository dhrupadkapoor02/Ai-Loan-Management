import apiClient from "./apiClient";

export async function apiListSavingsGoals() {
  const { data } = await apiClient.get("/savings-goals");
  return data.data.goals;
}

export async function apiCreateSavingsGoal(payload) {
  const { data } = await apiClient.post("/savings-goals", payload);
  return data.data.goal;
}

export async function apiUpdateSavingsGoal(id, payload) {
  const { data } = await apiClient.patch(`/savings-goals/${id}`, payload);
  return data.data.goal;
}

export async function apiDeleteSavingsGoal(id) {
  await apiClient.delete(`/savings-goals/${id}`);
}

export async function apiContributeSavingsGoal(id, amount) {
  const { data } = await apiClient.post(`/savings-goals/${id}/contribute`, { amount });
  return data.data.goal;
}
