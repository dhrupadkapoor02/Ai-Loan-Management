import { prisma } from "../prisma/client.js";

const publicSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isEmailVerified: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

export function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
}

export function findUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

export function findUserPublicById(id) {
  return prisma.user.findUnique({ where: { id }, select: publicSelect });
}

export function createUser({ name, email, password }) {
  return prisma.user.create({
    data: { name, email: email.toLowerCase(), password },
    select: publicSelect,
  });
}

export function updateUser(id, data) {
  return prisma.user.update({ where: { id }, data, select: publicSelect });
}

export function setEmailVerificationToken(id, { tokenHash, expiresAt }) {
  return prisma.user.update({
    where: { id },
    data: { emailVerificationToken: tokenHash, emailVerificationExpiry: expiresAt },
  });
}

export function findUserByEmailVerificationTokenHash(tokenHash) {
  return prisma.user.findFirst({
    where: {
      emailVerificationToken: tokenHash,
      emailVerificationExpiry: { gt: new Date() },
    },
  });
}

export function markEmailVerified(id) {
  return prisma.user.update({
    where: { id },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiry: null,
    },
    select: publicSelect,
  });
}

export function setPasswordResetToken(id, { tokenHash, expiresAt }) {
  return prisma.user.update({
    where: { id },
    data: { passwordResetToken: tokenHash, passwordResetExpiry: expiresAt },
  });
}

export function findUserByPasswordResetTokenHash(tokenHash) {
  return prisma.user.findFirst({
    where: {
      passwordResetToken: tokenHash,
      passwordResetExpiry: { gt: new Date() },
    },
  });
}

export function resetPassword(id, hashedPassword) {
  return prisma.user.update({
    where: { id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiry: null,
    },
    select: publicSelect,
  });
}

export { publicSelect as userPublicSelect };
