import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@store.com";

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_USER) {
    console.warn("[email] SMTP_USER not configured — skipping email send");
    return;
  }

  await transporter.sendMail({ from: FROM, to, subject, html });
}
