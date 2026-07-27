import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  setEmailVerificationToken,
  findUserByEmailVerificationTokenHash,
  markEmailVerified,
  setPasswordResetToken,
  findUserByPasswordResetTokenHash,
  resetPassword as persistNewPassword,
} from "../repositories/user.repository.js";
import {
  createRefreshToken,
  findActiveRefreshTokenByRawToken,
  revokeRefreshTokenById,
  revokeAllRefreshTokensForUser,
} from "../repositories/refreshToken.repository.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateRawToken, hashToken } from "../utils/crypto.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken, expiresInToDate } from "../utils/jwt.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../emails/authEmails.js";

const EMAIL_VERIFICATION_TTL = "24h";
const PASSWORD_RESET_TTL = "1h";

/**
 * Issues a fresh access + refresh token pair for a user and persists the
 * refresh token (hashed) so it can be revoked/rotated later.
 */
async function issueTokenPair(user, { userAgent, ipAddress } = {}) {
  const accessToken = signAccessToken(user);
  const rawRefreshToken = signRefreshToken(user);

  const refreshTokenRecord = await createRefreshToken({
    userId: user.id,
    rawToken: rawRefreshToken,
    expiresAt: expiresInToDate(env.JWT_REFRESH_EXPIRES_IN),
    userAgent,
    ipAddress,
  });

  return { accessToken, rawRefreshToken, refreshTokenRecord };
}

export async function register({ name, email, password }) {
  const existing = await findUserByEmail(email);
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const hashedPassword = await hashPassword(password);
  const user = await createUser({ name, email, password: hashedPassword });

  await sendVerificationToken(user);

  return user;
}

async function sendVerificationToken(user) {
  const rawToken = generateRawToken();
  await setEmailVerificationToken(user.id, {
    tokenHash: hashToken(rawToken),
    expiresAt: expiresInToDate(EMAIL_VERIFICATION_TTL),
  });
  await sendVerificationEmail({ to: user.email, name: user.name, rawToken });
}

export async function login({ email, password, userAgent, ipAddress }) {
  const user = await findUserByEmail(email);
  if (!user) throw ApiError.unauthorized("Invalid email or password");

  const passwordMatches = await comparePassword(password, user.password);
  if (!passwordMatches) throw ApiError.unauthorized("Invalid email or password");

  if (!user.isActive) throw ApiError.forbidden("This account has been deactivated");

  const { accessToken, rawRefreshToken } = await issueTokenPair(user, { userAgent, ipAddress });

  const { password: _omit, ...publicUser } = user;
  return { user: publicUser, accessToken, rawRefreshToken };
}

/**
 * Refresh-token rotation: every time a refresh token is used, it is revoked
 * and a brand-new one is issued in its place. If a revoked/already-rotated
 * token is presented again, that's a strong signal the token was stolen —
 * we respond by revoking the *entire* token family (all sessions) for that
 * user, forcing re-authentication everywhere.
 */
export async function refreshTokens({ rawRefreshToken, userAgent, ipAddress }) {
  if (!rawRefreshToken) throw ApiError.unauthorized("Refresh token is required");

  // Confirms signature + expiry on the JWT itself before touching the DB.
  verifyRefreshToken(rawRefreshToken);

  const existingRecord = await findActiveRefreshTokenByRawToken(rawRefreshToken);
  if (!existingRecord) throw ApiError.unauthorized("Refresh token is invalid");

  if (existingRecord.revoked) {
    // Reuse of a rotated/revoked token — treat as compromised.
    await revokeAllRefreshTokensForUser(existingRecord.userId);
    throw ApiError.unauthorized("Refresh token reuse detected. Please log in again.");
  }

  if (existingRecord.expiresAt < new Date()) {
    throw ApiError.unauthorized("Refresh token has expired");
  }

  const user = existingRecord.user;
  if (!user.isActive) throw ApiError.forbidden("This account has been deactivated");

  const { accessToken, rawRefreshToken: newRawRefreshToken, refreshTokenRecord } = await issueTokenPair(user, {
    userAgent,
    ipAddress,
  });

  await revokeRefreshTokenById(existingRecord.id, {
    replacedByTokenHash: refreshTokenRecord.tokenHash,
  });

  const { password: _omit, ...publicUser } = user;
  return { user: publicUser, accessToken, rawRefreshToken: newRawRefreshToken };
}

export async function logout({ rawRefreshToken }) {
  if (!rawRefreshToken) return;

  const existingRecord = await findActiveRefreshTokenByRawToken(rawRefreshToken);
  if (existingRecord && !existingRecord.revoked) {
    await revokeRefreshTokenById(existingRecord.id);
  }
}

export async function logoutAllDevices(userId) {
  await revokeAllRefreshTokensForUser(userId);
}

export async function verifyEmail(rawToken) {
  const user = await findUserByEmailVerificationTokenHash(hashToken(rawToken));
  if (!user) throw ApiError.badRequest("Verification link is invalid or has expired");

  return markEmailVerified(user.id);
}

export async function resendVerificationEmail(email) {
  const user = await findUserByEmail(email);
  // Intentionally do not reveal whether the email exists — same response
  // either way — to avoid leaking which emails are registered.
  if (!user || user.isEmailVerified) return;

  await sendVerificationToken(user);
}

export async function forgotPassword(email) {
  const user = await findUserByEmail(email);
  // Same non-enumeration principle as resendVerificationEmail.
  if (!user) return;

  const rawToken = generateRawToken();
  await setPasswordResetToken(user.id, {
    tokenHash: hashToken(rawToken),
    expiresAt: expiresInToDate(PASSWORD_RESET_TTL),
  });

  await sendPasswordResetEmail({ to: user.email, name: user.name, rawToken });
}

export async function resetPassword({ rawToken, newPassword }) {
  const user = await findUserByPasswordResetTokenHash(hashToken(rawToken));
  if (!user) throw ApiError.badRequest("Reset link is invalid or has expired");

  const hashedPassword = await hashPassword(newPassword);

  const updated = await persistNewPassword(user.id, hashedPassword);
  // Resetting the password invalidates every existing session — anyone who
  // had the old password (and any stolen refresh token) is logged out.
  await revokeAllRefreshTokensForUser(user.id);
  return updated;
}

export async function changePassword({ userId, currentPassword, newPassword }) {
  const user = await findUserById(userId);
  if (!user) throw ApiError.notFound("User not found");

  const matches = await comparePassword(currentPassword, user.password);
  if (!matches) throw ApiError.badRequest("Current password is incorrect");

  const hashedPassword = await hashPassword(newPassword);

  const updated = await persistNewPassword(userId, hashedPassword);
  // Same reasoning as resetPassword — a password change should kill every
  // other active session.
  await revokeAllRefreshTokensForUser(userId);
  return updated;
}

export async function updateProfile(userId, data) {
  return updateUser(userId, data);
}
