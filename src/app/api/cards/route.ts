import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCardSchema, normalizeCert } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
  }

  const cards = await prisma.stolenCard.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ cards });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
  }

  const ip = getClientIp(req);
  if (!rateLimit(`create-card:${session.user.id}:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "Troppe richieste. Riprova tra qualche minuto." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createCardSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Dati non validi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const certNumber = normalizeCert(parsed.data.certNumber);

  const existing = await prisma.stolenCard.findUnique({
    where: {
      gradingCompany_certNumber: {
        gradingCompany: parsed.data.gradingCompany,
        certNumber,
      },
    },
  });
  if (existing) {
    return NextResponse.json({ error: "Questa carta risulta già segnalata come rubata." }, { status: 409 });
  }

  const card = await prisma.stolenCard.create({
    data: {
      gradingCompany: parsed.data.gradingCompany,
      certNumber,
      cardName: parsed.data.cardName,
      grade: parsed.data.grade,
      certUrl: parsed.data.certUrl || null,
      signed: parsed.data.signed ?? false,
      signatureGrade: parsed.data.signed ? parsed.data.signatureGrade || null : null,
      description: parsed.data.description || null,
      photoUrl: parsed.data.photoUrl,
      contactPhone: parsed.data.contactPhone || null,
      reporterIp: ip,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ card }, { status: 201 });
}
