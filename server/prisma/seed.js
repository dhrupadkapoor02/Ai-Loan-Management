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

async function seedCategories(categories, type) {
  for (const { name, icon } of categories) {
    // Check if the default category already exists
    const existing = await prisma.category.findFirst({
      where: {
        userId: null,
        name,
        type,
      },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          userId: null,
          name,
          type,
          icon,
          isDefault: true,
        },
      });

      console.log(`✓ Created ${type}: ${name}`);
    } else {
      console.log(`• Skipped ${type}: ${name} (already exists)`);
    }
  }
}

async function main() {
  console.log("[seed] Seeding default categories...");

  await seedCategories(DEFAULT_INCOME_CATEGORIES, "INCOME");
  await seedCategories(DEFAULT_EXPENSE_CATEGORIES, "EXPENSE");

  console.log(
    `[seed] Done! Seeded ${DEFAULT_INCOME_CATEGORIES.length} income and ${DEFAULT_EXPENSE_CATEGORIES.length} expense categories.`
  );
}

main()
  .catch((err) => {
    console.error("[seed] Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });