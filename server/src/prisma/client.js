import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";

/**
 * Singleton Prisma Client.
 *
 * In dev, Node's module cache is cleared on every file change by nodemon's
 * restart, but if we ever move to something with HMR for the server, a naive
 * `new PrismaClient()` on every import would leak connections. We guard
 * against that by stashing the instance on `globalThis` outside production.
 */
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__prisma__ ??
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.__prisma__ = prisma;
}

export default prisma;
