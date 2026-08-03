/**
 * Prisma's `Decimal` fields come back as Decimal.js instances, not plain
 * numbers. They serialize to JSON as strings (via Decimal's toJSON), which
 * is technically safe but awkward for the frontend (string math bugs,
 * Chart.js expecting numbers, etc.). This converts named fields to real
 * JS numbers before a response leaves the service layer.
 *
 * Only use this on read paths, never before writing back to Prisma — for
 * writes, pass strings/numbers straight through and let Prisma's Decimal
 * handle precision.
 */
export function serializeDecimals(record, fields) {
  if (!record) return record;
  const copy = { ...record };
  for (const field of fields) {
    if (copy[field] !== null && copy[field] !== undefined) {
      copy[field] = Number(copy[field]);
    }
  }
  return copy;
}

export function serializeDecimalsList(records, fields) {
  return records.map((record) => serializeDecimals(record, fields));
}
