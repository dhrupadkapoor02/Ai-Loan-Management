import { prisma } from "../prisma/client.js";

export function createSavingsGoal({ userId, title, targetAmount, targetDate }) {
  return prisma.savingsGoal.create({ data: { userId, title, targetAmount, targetDate } });
}

export function findSavingsGoalById(id) {
  return prisma.savingsGoal.findUnique({ where: { id } });
}

export function findSavingsGoals(userId) {
  return prisma.savingsGoal.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

export function updateSavingsGoal(id, data) {
  return prisma.savingsGoal.update({ where: { id }, data });
}

export function deleteSavingsGoal(id) {
  return prisma.savingsGoal.delete({ where: { id } });
}

/**
 * Atomically increments currentAmount using a DB-level increment (not a
 * read-then-write from JS), so two concurrent contributions never clobber
 * each other. Also flips isCompleted once the target is reached.
 */
export async function contributeToGoal(id, amount) {
  const goal = await prisma.savingsGoal.update({
    where: { id },
    data: { currentAmount: { increment: amount } },
  });

  if (!goal.isCompleted && Number(goal.currentAmount) >= Number(goal.targetAmount)) {
    return prisma.savingsGoal.update({ where: { id }, data: { isCompleted: true } });
  }

  return goal;
}
