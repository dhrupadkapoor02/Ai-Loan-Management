import { prisma } from "../prisma/client.js";

/**
 * Runs a trivial round-trip query against Postgres so /api/health reflects
 * real DB connectivity, not just "the Node process is alive".
 */
export async function getHealthStatus() {
  const startedAt = Date.now();
  let database = "up";

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    database = "down";
  }

  return {
    status: database === "up" ? "ok" : "degraded",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database,
    responseTimeMs: Date.now() - startedAt,
  };
}
