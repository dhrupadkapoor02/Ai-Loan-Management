import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client.js";

/**
 * Transaction history merges two separate tables (Income, Expense) into one
 * chronological, paginated feed. Prisma's query builder can't paginate
 * across a UNION of two models, so this uses raw SQL — but every value is
 * still passed as a parameterized `Prisma.sql` template argument (never
 * string-concatenated), so this is not vulnerable to SQL injection. `alias`
 * arguments passed to `Prisma.raw` are always one of the two fixed literals
 * "i"/"e" defined in this file, never user input.
 */
function buildConditions(alias, userId, { categoryId, startDate, endDate }) {
  const parts = [Prisma.sql`${Prisma.raw(alias)}."userId" = ${userId}`];
  if (categoryId) parts.push(Prisma.sql`${Prisma.raw(alias)}."categoryId" = ${categoryId}`);
  if (startDate) parts.push(Prisma.sql`${Prisma.raw(alias)}.date >= ${startDate}`);
  if (endDate) parts.push(Prisma.sql`${Prisma.raw(alias)}.date < ${endDate}`);
  return Prisma.join(parts, " AND ");
}

function incomeSelect(userId, filters) {
  const where = buildConditions("i", userId, filters);
  return Prisma.sql`
    SELECT i.id, 'INCOME'::text AS type, i.amount, i.description, i.date,
           i."categoryId", i.source AS extra, NULL::text AS "paymentMethod",
           c.name AS "categoryName", c.icon AS "categoryIcon"
    FROM incomes i
    LEFT JOIN categories c ON c.id = i."categoryId"
    WHERE ${where}
  `;
}

function expenseSelect(userId, filters) {
  const where = buildConditions("e", userId, filters);
  return Prisma.sql`
    SELECT e.id, 'EXPENSE'::text AS type, e.amount, e.description, e.date,
           e."categoryId", NULL::text AS extra, e."paymentMethod",
           c.name AS "categoryName", c.icon AS "categoryIcon"
    FROM expenses e
    LEFT JOIN categories c ON c.id = e."categoryId"
    WHERE ${where}
  `;
}

export async function findTransactions(userId, filters, { skip, take }) {
  const { type } = filters;

  let unionQuery;
  if (type === "INCOME") {
    unionQuery = incomeSelect(userId, filters);
  } else if (type === "EXPENSE") {
    unionQuery = expenseSelect(userId, filters);
  } else {
    unionQuery = Prisma.sql`${incomeSelect(userId, filters)} UNION ALL ${expenseSelect(userId, filters)}`;
  }

  const [items, countResult] = await Promise.all([
    prisma.$queryRaw`
      SELECT * FROM (${unionQuery}) AS combined
      ORDER BY date DESC
      LIMIT ${take} OFFSET ${skip}
    `,
    prisma.$queryRaw`
      SELECT COUNT(*)::int AS count FROM (${unionQuery}) AS combined
    `,
  ]);

  return {
    items: items.map((row) => ({ ...row, amount: Number(row.amount) })),
    total: countResult[0]?.count ?? 0,
  };
}
