export function emailLayout({ title, bodyHtml }) {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1f2937;">
    <h2 style="color: #2563eb; margin-bottom: 4px;">${title}</h2>
    <div style="font-size: 14px; line-height: 1.6;">
      ${bodyHtml}
    </div>
    <hr style="margin-top: 32px; border: none; border-top: 1px solid #e5e7eb;" />
    <p style="font-size: 12px; color: #9ca3af;">
      AI-Powered Finance &amp; Loan Management System — this is an automated message, please don't reply.
    </p>
  </div>`;
}
