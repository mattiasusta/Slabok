import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEmailSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { hashVerificationCode } from "@/lib/email";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!rateLimit(`verify-email:${ip}`, 10, 15 * 60_000)) {
    return NextResponse.json({ error: "Troppi tentativi. Riprova tra qualche minuto." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = verifyEmailSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Codice non valido." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ error: "Account non trovato." }, { status: 404 });
  }

  if (user.emailVerifiedAt) {
    return NextResponse.json({ ok: true });
  }

  if (
    !user.emailVerificationCodeHash ||
    !user.emailVerificationCodeExpiresAt ||
    user.emailVerificationCodeExpiresAt < new Date()
  ) {
    return NextResponse.json({ error: "Codice scaduto. Richiedine uno nuovo." }, { status: 400 });
  }

  if (hashVerificationCode(parsed.data.code) !== user.emailVerificationCodeHash) {
    return NextResponse.json({ error: "Codice errato." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifiedAt: new Date(),
      emailVerificationCodeHash: null,
      emailVerificationCodeExpiresAt: null,
    },
  });

  return NextResponse.json({ ok: true });
}
