import { prisma } from "../prisma/client.js";

export function createLoan(data) {
  return prisma.loan.create({ data });
}

export function findLoanById(id) {
  return prisma.loan.findUnique({ where: { id } });
}

export function findLoansByUser(userId, { isActive } = {}) {
  const where = { userId };
  if (isActive !== undefined) where.isActive = isActive;
  return prisma.loan.findMany({ where, orderBy: { createdAt: "desc" } });
}

export function updateLoan(id, data) {
  return prisma.loan.update({ where: { id }, data });
}

export function deleteLoan(id) {
  return prisma.loan.delete({ where: { id } });
}

/** Total monthly EMI obligation from every currently-active saved loan — used by the eligibility checker. */
export async function sumActiveEmis(userId) {
  const result = await prisma.loan.aggregate({
    where: { userId, isActive: true },
    _sum: { emiAmount: true },
  });
  return Number(result._sum.emiAmount || 0);
}
