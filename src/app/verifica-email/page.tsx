"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerificaEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email] = useState(searchParams.get("email") || "");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Codice non valido.");
        return;
      }
      router.push("/login?verified=1");
    } catch {
      setError("Errore di rete. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    setInfo(null);
    setResending(true);
    try {
      const res = await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setInfo("Nuovo codice inviato, controlla la tua casella email.");
      } else {
        const data = await res.json();
        setError(data.error || "Errore durante l'invio.");
      }
    } catch {
      setError("Errore di rete. Riprova.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="space-y-4 pt-4">
      <h1 className="text-xl font-bold">Verifica la tua email</h1>
      <p className="text-sm text-slate-500">
        Abbiamo inviato un codice a 6 cifre a <strong>{email}</strong>. Inseriscilo qui sotto per
        attivare l&apos;account.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Codice di verifica</label>
          <input
            required
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-center text-2xl tracking-[0.5em]"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-emerald-600">{info}</p>}
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Verifica in corso..." : "Verifica"}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500">
        Non hai ricevuto il codice?{" "}
        <button onClick={handleResend} disabled={resending} className="text-indigo-600 hover:underline disabled:opacity-60">
          {resending ? "Invio..." : "Invia di nuovo"}
        </button>
      </p>
    </div>
  );
}

export default function VerificaEmailPage() {
  return (
    <Suspense>
      <VerificaEmailForm />
    </Suspense>
  );
}
