"use client";

import { useEffect, useState } from "react";
import { getStoredAdConsent, setStoredAdConsent } from "@/lib/adConsent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getStoredAdConsent() === null);
  }, []);

  function respond(value: "accepted" | "rejected") {
    setStoredAdConsent(value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-600">
          Usiamo cookie pubblicitari per mostrare annunci e mantenere il servizio gratuito. Puoi
          accettarli o rifiutarli — leggi i{" "}
          <a href="/termini" className="underline">
            Termini di Servizio
          </a>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => respond("rejected")}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Rifiuta
          </button>
          <button
            onClick={() => respond("accepted")}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700"
          >
            Accetta
          </button>
        </div>
      </div>
    </div>
  );
}
