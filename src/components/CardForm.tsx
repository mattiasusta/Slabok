"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GRADING_COMPANIES, GRADES, gradeLabel } from "@/lib/validation";

type CardFormInitialData = {
  gradingCompany: string;
  certNumber: string;
  cardName: string;
  grade: string;
  certUrl: string;
  description: string;
  photoUrl: string;
  contactPhone: string;
  signed: boolean;
  signatureGrade: string;
};

type CardFormProps = {
  mode: "create" | "edit";
  cardId?: string;
  initialData?: CardFormInitialData;
};

export function CardForm({ mode, cardId, initialData }: CardFormProps) {
  const router = useRouter();
  const [gradingCompany, setGradingCompany] = useState<string>(initialData?.gradingCompany ?? GRADING_COMPANIES[0]);
  const [certNumber, setCertNumber] = useState(initialData?.certNumber ?? "");
  const [cardName, setCardName] = useState(initialData?.cardName ?? "");
  const [grade, setGrade] = useState<string>(initialData?.grade ?? GRADES[0]);
  const [certUrl, setCertUrl] = useState(initialData?.certUrl ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [photoUrl, setPhotoUrl] = useState(initialData?.photoUrl ?? "");
  const [contactPhone, setContactPhone] = useState(initialData?.contactPhone ?? "");
  const [signed, setSigned] = useState(initialData?.signed ?? false);
  const [signatureGrade, setSignatureGrade] = useState<string>(initialData?.signatureGrade || GRADES[0]);
  const [certifyOwnership, setCertifyOwnership] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Errore durante il caricamento della foto.");
        setPhotoUrl("");
        return;
      }
      setPhotoUrl(data.url);
    } catch {
      setError("Errore di rete durante il caricamento della foto.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!certifyOwnership) {
      setError("Devi dichiarare che la carta è di tua proprietà.");
      return;
    }

    setLoading(true);
    try {
      const body =
        mode === "create"
          ? {
              gradingCompany,
              certNumber,
              cardName,
              grade,
              certUrl,
              description,
              photoUrl,
              contactPhone,
              signed,
              signatureGrade: signed ? signatureGrade : undefined,
              certifyOwnership,
            }
          : {
              cardName,
              grade,
              certUrl,
              description,
              photoUrl,
              contactPhone,
              signed,
              signatureGrade: signed ? signatureGrade : undefined,
              certifyOwnership,
            };

      const res = await fetch(mode === "create" ? "/api/cards" : `/api/cards/${cardId}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Errore durante il salvataggio.");
        return;
      }
      if (mode === "edit") {
        router.back();
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch {
      setError("Errore di rete. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 pt-4">
      <h1 className="text-xl font-bold">
        {mode === "create" ? "Segnala una carta rubata" : "Modifica segnalazione"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nome della carta</label>
          <input
            required
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="es. Charizard 1st Edition Holo"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Compagnia di grading</label>
          {mode === "create" ? (
            <select
              value={gradingCompany}
              onChange={(e) => setGradingCompany(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
            >
              {GRADING_COMPANIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          ) : (
            <input
              disabled
              value={gradingCompany}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-base text-slate-500"
            />
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Numero certificato</label>
          {mode === "create" ? (
            <input
              required
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
            />
          ) : (
            <input
              disabled
              value={certNumber}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-base text-slate-500"
            />
          )}
          {mode === "edit" && (
            <p className="mt-1 text-xs text-slate-400">
              Compagnia e numero certificato non sono modificabili: elimina la segnalazione e
              creane una nuova se hai sbagliato questi dati.
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Voto</label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
          >
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {gradeLabel(g)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Link alla pagina di verifica (opzionale)
          </label>
          <input
            type="url"
            value={certUrl}
            onChange={(e) => setCertUrl(e.target.value)}
            placeholder="es. https://www.psacard.com/cert/12345678"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
          />
          <p className="mt-1 text-xs text-slate-400">
            Link alla pagina del certificato sul sito PSA / BGS (Beckett) / CGC / TAG.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={signed}
            onChange={(e) => setSigned(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Carta firmata (autografo)
        </label>
        {signed && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Voto della firma</label>
            <select
              value={signatureGrade}
              onChange={(e) => setSignatureGrade(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {gradeLabel(g)}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Descrizione (opzionale)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Quando è stata rubata e come è successo (es. data, luogo, circostanze)"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Foto della carta (opzionale)</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-700"
          />
          {uploading && <p className="mt-1 text-xs text-slate-400">Caricamento in corso...</p>}
          {photoUrl && !uploading && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="Anteprima foto carta" className="mt-2 max-h-48 rounded-lg object-cover" />
          )}
          <p className="mt-1 text-xs text-slate-400">Facoltativa: JPG, PNG o WEBP, max 5 MB.</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Recapito telefonico (opzionale)</label>
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="es. +39 333 1234567"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
          />
          <p className="mt-1 text-xs text-slate-400">
            Se lo inserisci, verrà mostrato a chi verifica questa carta, per essere ricontattato.
          </p>
        </div>
        <label className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          <input
            type="checkbox"
            required
            checked={certifyOwnership}
            onChange={(e) => setCertifyOwnership(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300"
          />
          <span>
            Dichiaro sotto la mia responsabilità di essere il legittimo proprietario di questa
            carta e che quanto dichiarato corrisponde al vero. So che segnalazioni false possono
            avere conseguenze legali.
          </span>
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || uploading || !certifyOwnership}
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Salvataggio..." : mode === "create" ? "Salva segnalazione" : "Salva modifiche"}
        </button>
      </form>
    </div>
  );
}
