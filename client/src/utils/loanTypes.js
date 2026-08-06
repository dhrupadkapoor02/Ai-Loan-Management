export const LOAN_TYPES = [
  { value: "PERSONAL", label: "Personal Loan" },
  { value: "HOME", label: "Home Loan" },
  { value: "AUTO", label: "Auto Loan" },
  { value: "EDUCATION", label: "Education Loan" },
  { value: "BUSINESS", label: "Business Loan" },
  { value: "OTHER", label: "Other" },
];

export function loanTypeLabel(value) {
  return LOAN_TYPES.find((t) => t.value === value)?.label || value;
}

export const APPLICATION_STATUS_STYLES = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300",
  UNDER_REVIEW: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  APPROVED: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  CANCELLED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};
