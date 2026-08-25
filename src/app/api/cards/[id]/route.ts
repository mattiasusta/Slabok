import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateCardSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
  }

  const ip = getClientIp(req);
  if (!rateLimit(`update-card:${session.user.id}:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "Troppe richieste. Riprova tra qualche minuto." }, { status: 429 });
  }

  const { id } = await params;

  const existing = await prisma.stolenCard.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Segnalazione non trovata." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateCardSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Dati non validi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const card = await prisma.stolenCard.update({
    where: { id },
    data: {
      cardName: parsed.data.cardName,
      grade: parsed.data.grade,
      certUrl: parsed.data.certUrl || null,
      signed: parsed.data.signed ?? false,
      signatureGrade: parsed.data.signed ? parsed.data.signatureGrade || null : null,
      description: parsed.data.description || null,
      photoUrl: parsed.data.photoUrl || null,
      contactPhone: parsed.data.contactPhone || null,
    },
  });

  return NextResponse.json({ card });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
  }

  const { id } = await params;

  const card = await prisma.stolenCard.findUnique({ where: { id } });
  if (!card || card.userId !== session.user.id) {
    return NextResponse.json({ error: "Segnalazione non trovata." }, { status: 404 });
  }

  await prisma.stolenCard.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
