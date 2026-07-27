import nodemailer from "nodemailer";
import { env, isDevelopment } from "../config/env.js";

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn(
        "[mail] SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing). " +
          "Emails will be logged to the console instead of sent."
      );
    }
    // A "json transport" doesn't send anything — it just resolves — so the
    // rest of the app never has to special-case "no SMTP configured".
    transporter = nodemailer.createTransport({ jsonTransport: true });
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });

  return transporter;
}

/**
 * Sends an email and never throws into the caller's request flow — a
 * transient SMTP failure should not fail e.g. registration. Failures are
 * logged; callers that need to guarantee delivery should queue + retry
 * (out of scope for this module).
 */
export async function sendEmail({ to, subject, html, text }) {
  try {
    const info = await getTransporter().sendMail({
      from: env.MAIL_FROM,
      to,
      subject,
      html,
      text: text || stripHtml(html),
    });

    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(`[mail] Sent "${subject}" to ${to}`, info.message ? "" : info.messageId);
    }

    return info;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[mail] Failed to send "${subject}" to ${to}:`, err.message);
    return null;
  }
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, "").trim();
}
