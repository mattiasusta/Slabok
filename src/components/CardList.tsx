"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
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
  status: string;
  createdAt: string;
};

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  pending: { text: "In attesa di approvazione", className: "bg-amber-100 text-amber-800" },
  rejected: { text: "Rifiutata", className: "bg-red-100 text-red-700" },
};

type CardListProps = {
  cards: Card[];
  isAdminView?: boolean;
  searchable?: boolean;
};

export function CardList({ cards, isAdminView = false, searchable = false }: CardListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filteredCards = useMemo(() => {
    if (!searchable || !query.trim()) return cards;
    const q = query.trim().toLowerCase();
    return cards.filter(
      (c) =>
        c.cardName.toLowerCase().includes(q) ||
        c.certNumber.toLowerCase().includes(q) ||
        c.gradingCompany.toLowerCase().includes(q)
    );
  }, [cards, query, searchable]);

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

  async function handleStatusChange(id: string, status: "active" | "rejected") {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/cards/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) router.refresh();
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-3">
      {searchable && (
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca per nome carta o numero certificato..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
        />
      )}
      {searchable && filteredCards.length === 0 && (
        <p className="text-center text-sm text-slate-400">Nessuna segnalazione corrisponde alla ricerca.</p>
      )}
      <ul className="space-y-3">
        {filteredCards.map((card) => {
          const statusInfo = STATUS_LABEL[card.status];
          return (
            <li key={card.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  {statusInfo && (
                    <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.className}`}>
                      {statusInfo.text}
                    </span>
                  )}
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
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="flex gap-3">
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
                  {isAdminView && (
                    <div className="flex gap-2">
                      {card.status !== "active" && (
                        <button
                          onClick={() => handleStatusChange(card.id, "active")}
                          disabled={updatingId === card.id}
                          className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Approva
                        </button>
                      )}
                      {card.status !== "rejected" && (
                        <button
                          onClick={() => handleStatusChange(card.id, "rejected")}
                          disabled={updatingId === card.id}
                          className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300 disabled:opacity-50"
                        >
                          Rifiuta
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {card.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={card.photoUrl} alt="Foto carta" className="mt-3 max-h-48 w-full rounded-lg object-cover" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
