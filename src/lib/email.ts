import { randomInt, createHash } from "crypto";

// Invio email via API HTTP di Brevo invece di SMTP: molti host (Render incluso, sul piano
// gratuito) bloccano le connessioni SMTP in uscita per prevenire abusi/spam, ma non toccano
// le normali chiamate HTTPS come questa.
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export const VERIFICATION_CODE_TTL_MS = 15 * 60 * 1000; // 15 minuti

export function generateVerificationCode(): string {
  return randomInt(100000, 1000000).toString();
}

export function hashVerificationCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export async function sendVerificationEmail(to: string, code: string) {
  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "api-key": process.env.BREVO_API_KEY || "",
    },
    body: JSON.stringify({
      sender: { name: "SLABOK", email: process.env.EMAIL_FROM_ADDRESS },
      to: [{ email: to }],
      subject: "Il tuo codice di verifica SLABOK",
      textContent: `Il tuo codice di verifica è: ${code}\n\nScade tra 15 minuti. Se non hai richiesto questa registrazione, ignora questa email.`,
      htmlContent: `
        <p>Il tuo codice di verifica è:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
        <p>Scade tra 15 minuti. Se non hai richiesto questa registrazione, ignora questa email.</p>
      `,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Invio email fallito (${res.status}): ${body}`);
  }
}
