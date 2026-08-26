import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CardList } from "@/components/CardList";
import { AdSlot } from "@/components/AdSlot";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const cards = await prisma.stolenCard.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Le mie segnalazioni</h1>
        <Link
          href="/dashboard/new"
          className="rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Aggiungi
        </Link>
      </div>

      {cards.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          Non hai ancora segnalato nessuna carta.
        </p>
      ) : (
        <CardList
          cards={cards.map((c) => ({
            id: c.id,
            gradingCompany: c.gradingCompany,
            certNumber: c.certNumber,
            cardName: c.cardName,
            grade: c.grade,
            certUrl: c.certUrl,
            signed: c.signed,
            signatureGrade: c.signatureGrade,
            description: c.description,
            photoUrl: c.photoUrl,
            contactPhone: c.contactPhone,
            status: c.status,
            createdAt: c.createdAt.toISOString(),
          }))}
          searchable
        />
      )}

      <AdSlot variant="box" />
    </div>
  );
}
