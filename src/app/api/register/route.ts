import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import {
  generateVerificationCode,
  hashVerificationCode,
  sendVerificationEmail,
  VERIFICATION_CODE_TTL_MS,
} from "@/lib/email";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!rateLimit(`register:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Troppi tentativi. Riprova tra qualche minuto." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Email o password non validi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Esiste già un account con questa email." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const code = generateVerificationCode();

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      acceptedTosAt: new Date(),
      emailVerificationCodeHash: hashVerificationCode(code),
      emailVerificationCodeExpiresAt: new Date(Date.now() + VERIFICATION_CODE_TTL_MS),
    },
  });

  try {
    await sendVerificationEmail(email, code);
  } catch {
    return NextResponse.json(
      { error: "Account creato ma l'invio dell'email di verifica è fallito. Riprova più tardi." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, email });
}
