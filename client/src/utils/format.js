const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export function formatCurrency(amount) {
  return currencyFormatter.format(Number(amount) || 0);
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
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function toDateInputValue(dateString) {
  return new Date(dateString).toISOString().slice(0, 10);
}
