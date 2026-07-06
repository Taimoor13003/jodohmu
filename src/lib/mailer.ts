import nodemailer from "nodemailer";

/** Best-effort admin email notification. No-ops silently if SMTP isn't configured. */
export async function sendAdminEmail(subject: string, html: string) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO, CONTACT_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const to = CONTACT_TO || "taimoorghori13003@gmail.com";
  const from = CONTACT_FROM || SMTP_USER;

  await transporter.sendMail({ from, to, subject, html });
}
