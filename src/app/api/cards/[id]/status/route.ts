import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateStatusSchema } from "@/lib/validation";

// Approvazione/rifiuto di una segnalazione: riservato agli admin, separato dalla modifica
// dei contenuti (PATCH /api/cards/[id]) perché è un'azione di moderazione, non una modifica
// che il proprietario della segnalazione può fare su se stesso.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
  }
  if (!session.user.isAdmin) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 403 });
  }

  const { id } = await params;

  const existing = await prisma.stolenCard.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Segnalazione non trovata." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Stato non valido." }, { status: 400 });
  }

  const card = await prisma.stolenCard.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ card });
}
