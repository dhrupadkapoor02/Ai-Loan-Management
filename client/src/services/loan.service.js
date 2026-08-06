import apiClient from "./apiClient";

export async function apiCalculateEmi({ principal, interestRate, tenureMonths }) {
  const { data } = await apiClient.post("/loans/calculate-emi", { principal, interestRate, tenureMonths });
  return data.data;
}

export async function apiCompareLoans(offers) {
  const { data } = await apiClient.post("/loans/compare", { offers });
  return data.data.comparison;
}

export async function apiCheckEligibility({ requestedAmount, interestRate, tenureMonths }) {
  const { data } = await apiClient.post("/loans/check-eligibility", {
    requestedAmount,
    interestRate,
    tenureMonths,
  });
  return data.data;
}

export async function apiListLoans(params = {}) {
  const { data } = await apiClient.get("/loans", { params });
  return data.data.loans;
}

export async function apiSaveLoan(payload) {
  const { data } = await apiClient.post("/loans", payload);
  return data.data.loan;
}

export async function apiUpdateLoan(id, payload) {
  const { data } = await apiClient.patch(`/loans/${id}`, payload);
  return data.data.loan;
}

export async function apiDeleteLoan(id) {
  await apiClient.delete(`/loans/${id}`);
}
