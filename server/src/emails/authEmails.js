import { env } from "../config/env.js";
import { sendEmail } from "./mailer.js";
import { emailLayout } from "./layout.js";

export async function sendVerificationEmail({ to, name, rawToken }) {
  const verifyUrl = `${env.CLIENT_URL}/verify-email/${rawToken}`;

  return sendEmail({
    to,
    subject: "Verify your email address",
    html: emailLayout({
      title: "Confirm your email",
      bodyHtml: `
        <p>Hi ${escapeHtml(name)},</p>
        <p>Thanks for signing up. Please confirm your email address to activate your account.</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
            Verify Email
          </a>
        </p>
        <p>Or paste this link into your browser:<br />${verifyUrl}</p>
        <p>This link expires in 24 hours.</p>
      `,
    }),
  });
}

export async function sendPasswordResetEmail({ to, name, rawToken }) {
  const resetUrl = `${env.CLIENT_URL}/reset-password/${rawToken}`;

  return sendEmail({
    to,
    subject: "Reset your password",
    html: emailLayout({
      title: "Reset your password",
      bodyHtml: `
        <p>Hi ${escapeHtml(name)},</p>
        <p>We received a request to reset your password. If this wasn't you, you can safely ignore this email.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
            Reset Password
          </a>
        </p>
        <p>Or paste this link into your browser:<br />${resetUrl}</p>
        <p>This link expires in 1 hour.</p>
      `,
    }),
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
