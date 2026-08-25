"use client";

import { useState } from "react";
import { GRADING_COMPANIES, gradeLabel } from "@/lib/validation";

type Result = {
  stolen: boolean;
  reportId: string | null;
  reportedAt: string | null;
  cardName: string | null;
  grade: string | null;
  certUrl: string | null;
  signed: boolean;
  signatureGrade: string | null;
  description: string | null;
  photoUrl: string | null;
  contactPhone: string | null;
};

export function SearchForm() {
  const [company, setCompany] = useState<string>(GRADING_COMPANIES[0]);
  const [cert, setCert] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!cert.trim()) {
      setError("Inserisci il numero di certificato.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/check?company=${encodeURIComponent(company)}&cert=${encodeURIComponent(cert)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Errore durante la verifica.");
        return;
      }
      setResult(data);
    } catch {
      setError("Errore di rete. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  const disputeHref = result?.reportId
    ? `mailto:slabok.cstservice@gmail.com?subject=${encodeURIComponent(
        `Contestazione segnalazione ${company} #${cert}`
      )}&body=${encodeURIComponent(
        `Vorrei contestare la segnalazione con id ${result.reportId} (compagnia ${company}, certificato ${cert}).\n\nMotivo:\n`
      )}`
    : null;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Compagnia di grading</label>
          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
          >
            {GRADING_COMPANIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Numero certificato</label>
          <input
            value={cert}
            onChange={(e) => setCert(e.target.value)}
            placeholder="es. 84759201"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Verifica in corso..." : "Verifica carta"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            result.stolen
              ? "border-red-300 bg-red-50 text-red-800"
              : "border-emerald-300 bg-emerald-50 text-emerald-800"
          }`}
        >
          {result.stolen ? (
            <>
              <p className="font-semibold">⚠️ Attenzione: carta segnalata come rubata</p>
              {result.cardName && <p className="mt-1 text-xs opacity-80">{result.cardName}</p>}
              {result.grade && (
                <p className="mt-1 text-xs opacity-80">
                  Voto: {gradeLabel(result.grade)}
                  {result.signed && result.signatureGrade && (
                    <> · Autografo: {gradeLabel(result.signatureGrade)}</>
                  )}
                </p>
              )}
              {result.certUrl && (
                <p className="mt-1 text-xs opacity-80">
                  <a href={result.certUrl} target="_blank" rel="noopener noreferrer" className="underline">
                    Verifica il certificato originale
                  </a>
                </p>
              )}
              {result.reportedAt && (
                <p className="mt-1 text-xs opacity-80">
                  Segnalata il {new Date(result.reportedAt).toLocaleDateString("it-IT")}
                </p>
              )}
              {result.description && <p className="mt-1 text-xs opacity-80">Nota: {result.description}</p>}
              {result.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={result.photoUrl}
                  alt="Foto della carta segnalata"
                  className="mt-2 max-h-48 w-full rounded-lg object-cover"
                />
              )}
              {result.contactPhone && (
                <p className="mt-2 text-xs opacity-80">
                  Contatta il proprietario:{" "}
                  <a href={`tel:${result.contactPhone}`} className="font-semibold underline">
                    {result.contactPhone}
                  </a>
                </p>
              )}
              {disputeHref && (
                <p className="mt-3 border-t border-red-200 pt-2 text-xs">
                  <a href={disputeHref} className="text-red-700 underline">
                    Ritieni questa segnalazione errata? Contestala
                  </a>
                </p>
              )}
            </>
          ) : (
            <p className="font-semibold">✅ Nessuna segnalazione trovata per questa carta</p>
          )}
        </div>
      )}
    </div>
  );
}
