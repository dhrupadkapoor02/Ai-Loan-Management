import apiClient from "./apiClient";

export async function apiSubmitLoanApplication(payload) {
  const { data } = await apiClient.post("/loan-applications", payload);
  return data.data.application;
}

export async function apiListLoanApplications(params = {}) {
  const { data } = await apiClient.get("/loan-applications", { params });
  return data.data.applications;
}

export async function apiGetLoanApplication(id) {
  const { data } = await apiClient.get(`/loan-applications/${id}`);
  return data.data.application;
}

export async function apiCancelLoanApplication(id) {
  const { data } = await apiClient.post(`/loan-applications/${id}/cancel`);
  return data.data.application;
}
