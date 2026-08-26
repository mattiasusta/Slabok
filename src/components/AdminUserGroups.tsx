"use client";

import { useState } from "react";
import { CardList } from "@/components/CardList";

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

type Group = {
  userId: string;
  email: string;
  cards: Card[];
};

export function AdminUserGroups({ groups }: { groups: Group[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(userId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const isOpen = expanded.has(group.userId);
        const pendingCount = group.cards.filter((c) => c.status === "pending").length;

        return (
          <div key={group.userId} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <button
              onClick={() => toggle(group.userId)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <div>
                <p className="font-semibold text-slate-900">{group.email}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {group.cards.length} segnalazion{group.cards.length === 1 ? "e" : "i"}
                  {pendingCount > 0 && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      {pendingCount} in attesa
                    </span>
                  )}
                </p>
              </div>
              <span className="shrink-0 text-lg text-slate-400">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <div className="border-t border-slate-100 bg-slate-50 p-4">
                <CardList cards={group.cards} isAdminView />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
