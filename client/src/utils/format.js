const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function formatCurrency(amount) {
  return currencyFormatter.format(Number(amount) || 0);
}

/** Compact form for tight spaces (cards, chart labels) — e.g. ₹1.2L, ₹3.5Cr, using the Indian lakh/crore system. */
const compactCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCurrencyCompact(amount) {
  return compactCurrencyFormatter.format(Number(amount) || 0);
}

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function monthLabel(month, year) {
  return `${MONTH_NAMES[month - 1].slice(0, 3)} ${year}`;
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function toDateInputValue(dateString) {
  return new Date(dateString).toISOString().slice(0, 10);
}
