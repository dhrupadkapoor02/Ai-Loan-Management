import apiClient from "./apiClient";

export async function apiListTransactions(params = {}) {
  const { data } = await apiClient.get("/transactions", { params });
  return { transactions: data.data.transactions, meta: data.meta };
}
