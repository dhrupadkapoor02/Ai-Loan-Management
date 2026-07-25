import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./prisma/client.js";

const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] Listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

/**
 * Graceful shutdown: stop accepting new connections, close the DB pool,
 * then exit. Prevents dropped requests and orphaned DB connections on
 * deploy/restart (important on Render, which sends SIGTERM on redeploy).
 */
async function shutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`\n[server] Received ${signal}, shutting down gracefully...`);

  server.close(async () => {
    await prisma.$disconnect();
    // eslint-disable-next-line no-console
    console.log("[server] Closed all connections. Bye.");
    process.exit(0);
  });

  // Force-exit if shutdown hangs for too long.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  // eslint-disable-next-line no-console
  console.error("[server] Unhandled Rejection:", reason);
});
