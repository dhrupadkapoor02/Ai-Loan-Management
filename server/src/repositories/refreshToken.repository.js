import { prisma } from "../prisma/client.js";
import { hashToken } from "../utils/crypto.js";

export function createRefreshToken({ userId, rawToken, expiresAt, userAgent, ipAddress }) {
  return prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt,
      userAgent,
      ipAddress,
    },
  });
}

export function findActiveRefreshTokenByRawToken(rawToken) {
  return prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { user: true },
  });
}

export function revokeRefreshTokenById(id, { replacedByTokenHash = null } = {}) {
  return prisma.refreshToken.update({
    where: { id },
    data: { revoked: true, replacedByTokenHash },
  });
}

export function revokeAllRefreshTokensForUser(userId) {
  return prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
}

/** Housekeeping — safe to run on a cron/schedule; not wired to a route. */
export function deleteExpiredRefreshTokens() {
  return prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
}
