import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_INCOME_CATEGORIES = [
  { name: "Salary", icon: "wallet" },
  { name: "Freelance", icon: "briefcase" },
  { name: "Business", icon: "store" },
  { name: "Investments", icon: "trending-up" },
  { name: "Gifts", icon: "gift" },
  { name: "Other Income", icon: "plus-circle" },
];

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Rent/Housing", icon: "home" },
  { name: "Groceries", icon: "shopping-cart" },
  { name: "Utilities", icon: "zap" },
  { name: "Transportation", icon: "car" },
  { name: "Healthcare", icon: "heart-pulse" },
  { name: "Entertainment", icon: "film" },
  { name: "Dining Out", icon: "utensils" },
  { name: "Shopping", icon: "shopping-bag" },
  { name: "Education", icon: "book" },
  { name: "Insurance", icon: "shield" },
  { name: "Loan/EMI Payments", icon: "credit-card" },
  { name: "Other Expense", icon: "more-horizontal" },
];

async function seedCategories(list, type) {
  for (const { name, icon } of list) {
    // Prisma's generated compound-unique input type won't accept `null`
    // for a nullable field inside upsert's `where` clause, even though the
    // schema permits it — so we do the find-then-create/update manually
    // instead of relying on upsert's compound-key shortcut.
    const existing = await prisma.category.findFirst({
      where: { userId: null, name, type },
    });

    if (existing) {
      await prisma.category.update({
        where: { id: existing.id },
        data: { icon, isDefault: true },
      });
    } else {
      await prisma.category.create({
        data: { userId: null, name, type, icon, isDefault: true },
      });
    }
  }
}

async function main() {
  // eslint-disable-next-line no-console
  console.log("[seed] Seeding default categories...");
  await seedCategories(DEFAULT_INCOME_CATEGORIES, "INCOME");
  await seedCategories(DEFAULT_EXPENSE_CATEGORIES, "EXPENSE");
  // eslint-disable-next-line no-console
  console.log(
    `[seed] Done: ${DEFAULT_INCOME_CATEGORIES.length} income + ${DEFAULT_EXPENSE_CATEGORIES.length} expense categories ready.`
  );
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("[seed] Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
