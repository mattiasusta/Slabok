"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { gradeLabel } from "@/lib/validation";

type Card = {
  id: string;
  gradingCompany: string;
  certNumber: string;
  cardName: string;
  grade: string;
  certUrl: string | null;
  signed: boolean;
  signatureGrade: string | null;
  description: string | null;
  photoUrl: string | null;
  contactPhone: string | null;
  createdAt: string;
};

export function CardList({ cards }: { cards: Card[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Rimuovere questa segnalazione?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/cards/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <ul className="space-y-3">
      {cards.map((card) => (
        <li key={card.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900">{card.cardName}</p>
              <p className="text-xs text-slate-500">
                {card.gradingCompany} #{card.certNumber} · Voto {gradeLabel(card.grade)}
                {card.signed && card.signatureGrade && (
                  <> · Autografo {gradeLabel(card.signatureGrade)}</>
                )}
              </p>
              {card.certUrl && (
                <a
                  href={card.certUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Pagina di verifica
                </a>
              )}
              {card.description && <p className="mt-1 text-sm text-slate-500">{card.description}</p>}
              {card.contactPhone && (
                <p className="mt-1 text-xs text-slate-500">Recapito mostrato: {card.contactPhone}</p>
              )}
              <p className="mt-1 text-xs text-slate-400">
                Segnalata il {new Date(card.createdAt).toLocaleDateString("it-IT")}
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link
                href={`/dashboard/edit/${card.id}`}
                className="text-xs font-medium text-indigo-600 hover:underline"
              >
                Modifica
              </Link>
              <button
                onClick={() => handleDelete(card.id)}
                disabled={deletingId === card.id}
                className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
              >
                Rimuovi
              </button>
            </div>
          </div>
          {card.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={card.photoUrl} alt="Foto carta" className="mt-3 max-h-48 w-full rounded-lg object-cover" />
          )}
        </li>
      ))}
    </ul>
  );
}
