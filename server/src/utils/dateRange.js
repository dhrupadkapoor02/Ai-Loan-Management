/**
 * Returns the [start, end) Date range for a given month/year, in UTC, so
 * "January 2026" always means the same instant regardless of server
 * timezone. `month` is 1-indexed (1 = January) to match how it's stored on
 * Budget and how humans think about it.
 */
export function monthRange(month, year) {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  return { start, end };
}

/** The current UTC month/year, used as the default when a route doesn't specify one. */
export function currentMonthYear() {
  const now = new Date();
  return { month: now.getUTCMonth() + 1, year: now.getUTCFullYear() };
}

/**
 * Returns an array of the last `count` {month, year} pairs ending with the
 * given month/year (inclusive), oldest first — used to build trend charts
 * (monthly expenses, income vs expense, savings trend).
 */
export function lastNMonths(count, { month, year } = currentMonthYear()) {
  const result = [];
  let m = month;
  let y = year;
  for (let i = 0; i < count; i++) {
    result.unshift({ month: m, year: y });
    m -= 1;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
  }
  return result;
}
