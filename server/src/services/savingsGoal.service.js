import * as savingsGoalRepo from "../repositories/savingsGoal.repository.js";
import { serializeDecimals, serializeDecimalsList } from "../utils/serialize.js";
import { ApiError } from "../utils/ApiError.js";

const DECIMAL_FIELDS = ["targetAmount", "currentAmount"];

async function getOwnedGoal(userId, id) {
  const goal = await savingsGoalRepo.findSavingsGoalById(id);
  if (!goal) throw ApiError.notFound("Savings goal not found");
  if (goal.userId !== userId) throw ApiError.forbidden("You do not have access to this savings goal");
  return goal;
}

export async function createSavingsGoal(userId, { title, targetAmount, targetDate }) {
  const goal = await savingsGoalRepo.createSavingsGoal({
    userId,
    title,
    targetAmount,
    targetDate: targetDate ? new Date(targetDate) : null,
  });
  return serializeDecimals(goal, DECIMAL_FIELDS);
}

export async function listSavingsGoals(userId) {
  const goals = await savingsGoalRepo.findSavingsGoals(userId);
  return serializeDecimalsList(goals, DECIMAL_FIELDS);
}

export async function updateSavingsGoal(userId, id, data) {
  await getOwnedGoal(userId, id);
  const updateData = { ...data };
  if (updateData.targetDate) updateData.targetDate = new Date(updateData.targetDate);

  const updated = await savingsGoalRepo.updateSavingsGoal(id, updateData);
  return serializeDecimals(updated, DECIMAL_FIELDS);
}

export async function deleteSavingsGoal(userId, id) {
  await getOwnedGoal(userId, id);
  await savingsGoalRepo.deleteSavingsGoal(id);
}

export async function contribute(userId, id, amount) {
  await getOwnedGoal(userId, id);
  const updated = await savingsGoalRepo.contributeToGoal(id, amount);
  return serializeDecimals(updated, DECIMAL_FIELDS);
}
