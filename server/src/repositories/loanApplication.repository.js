import { prisma } from "../prisma/client.js";

const includeUser = { user: { select: { id: true, name: true, email: true } } };

export function createLoanApplication(data) {
  return prisma.loanApplication.create({ data });
}

export function findLoanApplicationById(id) {
  return prisma.loanApplication.findUnique({ where: { id }, include: includeUser });
}

export function findLoanApplicationsByUser(userId, { status } = {}) {
  const where = { userId };
  if (status) where.status = status;
  return prisma.loanApplication.findMany({ where, orderBy: { createdAt: "desc" } });
}

export function updateLoanApplication(id, data) {
  return prisma.loanApplication.update({ where: { id }, data, include: includeUser });
}

/**
 * Admin-facing listing across every user's applications — not routed yet
 * (Module 10 adds the admin routes), but the query lives here now so the
 * data-access layer stays complete alongside the model.
 */
export function findAllLoanApplications({ status } = {}) {
  const where = {};
  if (status) where.status = status;
  return prisma.loanApplication.findMany({
    where,
    include: includeUser,
    orderBy: { createdAt: "desc" },
  });
}
