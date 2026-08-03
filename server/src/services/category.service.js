import * as categoryRepo from "../repositories/category.repository.js";
import { ApiError } from "../utils/ApiError.js";

export function listCategories(userId, type) {
  return categoryRepo.findAvailableCategories(userId, type);
}

export async function createCategory(userId, { name, type, icon }) {
  const existing = await categoryRepo.findCategoryByNameAndType({ userId, name, type });
  if (existing) throw ApiError.conflict(`A ${type.toLowerCase()} category named "${name}" already exists`);

  return categoryRepo.createCustomCategory({ userId, name, type, icon });
}

async function getOwnedCustomCategory(userId, id) {
  const category = await categoryRepo.findCategoryById(id);
  if (!category) throw ApiError.notFound("Category not found");
  if (category.isDefault) throw ApiError.forbidden("Default categories cannot be modified");
  if (category.userId !== userId) throw ApiError.forbidden("You do not have access to this category");
  return category;
}

export async function updateCategory(userId, id, data) {
  await getOwnedCustomCategory(userId, id);
  return categoryRepo.updateCategory(id, data);
}

export async function deleteCategory(userId, id) {
  await getOwnedCustomCategory(userId, id);
  await categoryRepo.deleteCategory(id);
}

/**
 * Shared helper used by income/expense/budget services: if a categoryId is
 * provided, confirm it exists, is the right type, and is either a system
 * default or owned by this user. Returns the category (or null if none
 * was provided) so callers can also check `.type`.
 */
export async function assertUsableCategory(userId, categoryId, expectedType) {
  if (!categoryId) return null;

  const category = await categoryRepo.findCategoryById(categoryId);
  if (!category) throw ApiError.badRequest("Category not found");
  if (category.userId !== null && category.userId !== userId) {
    throw ApiError.forbidden("You do not have access to this category");
  }
  if (category.type !== expectedType) {
    throw ApiError.badRequest(`Category must be of type ${expectedType}`);
  }
  return category;
}
