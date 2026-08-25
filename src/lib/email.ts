import nodemailer from "nodemailer";
import { randomInt, createHash } from "crypto";

// Porta 587 (STARTTLS) esplicita invece del preset "service: gmail" (che usa la 465):
// alcuni host bloccano di default la 465 in uscita per prevenire spam.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const VERIFICATION_CODE_TTL_MS = 15 * 60 * 1000; // 15 minuti

export function generateVerificationCode(): string {
  return randomInt(100000, 1000000).toString();
}

export function hashVerificationCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export async function sendVerificationEmail(to: string, code: string) {
  await transporter.sendMail({
    from: `"SLABOK" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Il tuo codice di verifica SLABOK",
    text: `Il tuo codice di verifica è: ${code}\n\nScade tra 15 minuti. Se non hai richiesto questa registrazione, ignora questa email.`,
    html: `
      <p>Il tuo codice di verifica è:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
      <p>Scade tra 15 minuti. Se non hai richiesto questa registrazione, ignora questa email.</p>
    `,
  });
}
