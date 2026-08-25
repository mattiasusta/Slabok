import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkQuerySchema, normalizeCert } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// Endpoint pubblico: chiunque può verificare una carta senza autenticarsi.
export async function GET(req: Request) {
  const ip = getClientIp(req);
  if (!rateLimit(`check:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: "Troppe richieste. Riprova tra qualche minuto." }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const parsed = checkQuerySchema.safeParse({
    company: searchParams.get("company"),
    cert: searchParams.get("cert"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Compagnia o numero certificato non validi." }, { status: 400 });
  }

  const cert = normalizeCert(parsed.data.cert);

  const record = await prisma.stolenCard.findFirst({
    where: { gradingCompany: parsed.data.company, certNumber: cert, status: "active" },
    select: {
      id: true,
      createdAt: true,
      cardName: true,
      grade: true,
      certUrl: true,
      signed: true,
      signatureGrade: true,
      description: true,
      photoUrl: true,
      contactPhone: true,
    },
  });

  // Non restituiamo mai email, id utente o IP della vittima. Il telefono viene mostrato
  // solo se chi ha fatto la segnalazione ha scelto esplicitamente di condividerlo.
  return NextResponse.json({
    stolen: !!record,
    reportId: record?.id ?? null,
    reportedAt: record?.createdAt ?? null,
    cardName: record?.cardName ?? null,
    grade: record?.grade ?? null,
    certUrl: record?.certUrl ?? null,
    signed: record?.signed ?? false,
    signatureGrade: record?.signatureGrade ?? null,
    description: record?.description ?? null,
    photoUrl: record?.photoUrl ?? null,
    contactPhone: record?.contactPhone ?? null,
  });
}
