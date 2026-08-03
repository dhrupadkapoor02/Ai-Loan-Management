import { prisma } from "../prisma/client.js";

/** Every category visible to a user: system defaults (userId null) + their own custom ones. */
export function findAvailableCategories(userId, type) {
  return prisma.category.findMany({
    where: {
      type,
      OR: [{ userId: null }, { userId }],
    },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
}

export function findCategoryById(id) {
  return prisma.category.findUnique({ where: { id } });
}

export function createCustomCategory({ userId, name, type, icon }) {
  return prisma.category.create({
    data: { userId, name, type, icon, isDefault: false },
  });
}

export function updateCategory(id, data) {
  return prisma.category.update({ where: { id }, data });
}

export function deleteCategory(id) {
  return prisma.category.delete({ where: { id } });
}

export function findCategoryByNameAndType({ userId, name, type }) {
  return prisma.category.findFirst({
    where: { name, type, OR: [{ userId: null }, { userId }] },
  });
}
