import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CardList } from "@/components/CardList";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (!session.user.isAdmin) redirect("/dashboard");

  const cards = await prisma.stolenCard.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, email: true } } },
  });

  type Group = { userId: string; email: string; cards: typeof cards };
  const groups: Group[] = [];
  const indexByUser = new Map<string, number>();
  for (const card of cards) {
    let idx = indexByUser.get(card.userId);
    if (idx === undefined) {
      idx = groups.length;
      indexByUser.set(card.userId, idx);
      groups.push({ userId: card.userId, email: card.user.email, cards: [] });
    }
    groups[idx].cards.push(card);
  }

  return (
    <div className="space-y-6 pt-4">
      <div>
        <h1 className="text-xl font-bold">Amministrazione</h1>
        <p className="text-sm text-slate-500">
          {cards.length} segnalazion{cards.length === 1 ? "e" : "i"} da {groups.length} utent
          {groups.length === 1 ? "e" : "i"}.
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          Nessuna segnalazione presente.
        </p>
      ) : (
        groups.map((group) => (
          <div key={group.userId} className="space-y-3">
            <h2 className="border-b border-slate-200 pb-1 text-sm font-semibold text-slate-700">
              {group.email}{" "}
              <span className="font-normal text-slate-400">
                ({group.cards.length} segnalazion{group.cards.length === 1 ? "e" : "i"})
              </span>
            </h2>
            <CardList
              cards={group.cards.map((c) => ({
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
                createdAt: c.createdAt.toISOString(),
              }))}
            />
          </div>
        ))
      )}
    </div>
  );
}
