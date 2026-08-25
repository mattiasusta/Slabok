import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resendVerificationSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import {
  generateVerificationCode,
  hashVerificationCode,
  sendVerificationEmail,
  VERIFICATION_CODE_TTL_MS,
} from "@/lib/email";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!rateLimit(`resend-verification:${ip}`, 3, 15 * 60_000)) {
    return NextResponse.json({ error: "Troppi tentativi. Riprova tra qualche minuto." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = resendVerificationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email non valida." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  // Risposta identica indipendentemente dall'esistenza dell'utente, per non rivelare
  // quali email sono registrate.
  if (!user || user.emailVerifiedAt) {
    return NextResponse.json({ ok: true });
  }

  const code = generateVerificationCode();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationCodeHash: hashVerificationCode(code),
      emailVerificationCodeExpiresAt: new Date(Date.now() + VERIFICATION_CODE_TTL_MS),
    },
  });

  try {
    await sendVerificationEmail(email, code);
  } catch {
    return NextResponse.json({ error: "Invio email fallito. Riprova più tardi." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
